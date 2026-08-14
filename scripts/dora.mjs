#!/usr/bin/env node
/**
 * Computes the four DORA metrics from this repository's own deployment
 * history, and writes them as JSON for the pipeline page to render.
 *
 * Nothing here is hand-entered. If the numbers look bad, the pipeline is bad.
 *
 * Env:
 *   GITHUB_TOKEN       required for anything beyond the anonymous rate limit
 *   GITHUB_REPOSITORY  owner/repo, provided by Actions
 *   WINDOW_DAYS        lookback window, default 90
 *   OUT                output path, default src/data/dora.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { SITE } from '../site.config.mjs';

const REPO = process.env.GITHUB_REPOSITORY || SITE.repo;
const TOKEN = process.env.GITHUB_TOKEN || '';
const WINDOW_DAYS = Number(process.env.WINDOW_DAYS || 90);
const OUT = process.env.OUT || 'src/data/dora.json';
const API = 'https://api.github.com';

const HOUR = 1000 * 60 * 60;
const since = Date.now() - WINDOW_DAYS * 24 * HOUR;

async function gh(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'resume-site-dora',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

/** Median, in the same unit as the input. */
function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const round = (n, dp = 1) => (n === null ? null : Number(n.toFixed(dp)));

/** DORA performance bands. Thresholds follow the published state-of-devops levels. */
function band(metric, value) {
  if (value === null) return null;
  const scales = {
    // deployments per week
    deploymentFrequency: [
      [7, 'elite'],
      [1, 'high'],
      [0.23, 'medium'],
    ],
    // hours, lower is better
    leadTimeForChanges: [
      [24, 'elite'],
      [168, 'high'],
      [730, 'medium'],
    ],
    // percent, lower is better
    changeFailureRate: [
      [5, 'elite'],
      [10, 'high'],
      [15, 'medium'],
    ],
    // hours, lower is better
    timeToRestore: [
      [1, 'elite'],
      [24, 'high'],
      [168, 'medium'],
    ],
  };
  const scale = scales[metric];
  if (!scale) return null;
  if (metric === 'deploymentFrequency') {
    for (const [threshold, label] of scale) if (value >= threshold) return label;
    return 'low';
  }
  for (const [threshold, label] of scale) if (value <= threshold) return label;
  return 'low';
}

async function collectDeployments(environment) {
  const all = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await gh(
      `/repos/${REPO}/deployments?environment=${environment}&per_page=100&page=${page}`
    );
    if (!batch || !batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

/** States that actually say how a deployment turned out. */
const OUTCOME_STATES = new Set(['success', 'failure', 'error']);

/**
 * The outcome of a deployment, and when it happened.
 *
 * Taking the newest status outright gets this wrong. GitHub appends an
 * `inactive` status to a deployment once a later one supersedes it, so the
 * status list reads [inactive, success, in_progress] and the newest entry
 * describes the deployment's *state*, not its *result*. Only success, failure,
 * and error say how it went, so filter to those and take the newest.
 */
async function latestState(deploymentId) {
  const statuses = await gh(`/repos/${REPO}/deployments/${deploymentId}/statuses?per_page=100`);
  if (!statuses || !statuses.length) return null;
  const outcomes = statuses
    .filter((s) => OUTCOME_STATES.has(s.state))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (!outcomes.length) return null; // still pending or in progress
  return { state: outcomes[0].state, at: new Date(outcomes[0].created_at).getTime() };
}

async function commitAuthoredAt(sha) {
  const commit = await gh(`/repos/${REPO}/commits/${sha}`);
  const date = commit?.commit?.author?.date ?? commit?.commit?.committer?.date;
  return date ? new Date(date).getTime() : null;
}

async function main() {
  const prodDeployments = await collectDeployments('production');

  // Resolve each deployment's final state and keep the ones in the window.
  const resolved = [];
  for (const d of prodDeployments) {
    const status = await latestState(d.id);
    if (!status) continue;
    if (status.at < since) continue;
    resolved.push({ sha: d.sha, ref: d.ref, state: status.state, at: status.at });
  }
  resolved.sort((a, b) => a.at - b.at);

  const successes = resolved.filter((d) => d.state === 'success');
  const failures = resolved.filter((d) => d.state === 'failure' || d.state === 'error');

  // Deployment frequency, per week.
  const weeks = WINDOW_DAYS / 7;
  const deploymentFrequency = successes.length ? successes.length / weeks : null;

  // Lead time for changes: commit authored until it reached Production.
  const leadTimes = [];
  for (const d of successes) {
    const authored = await commitAuthoredAt(d.sha);
    if (authored === null) continue;
    const hours = (d.at - authored) / HOUR;
    if (hours >= 0) leadTimes.push(hours);
  }
  const leadTimeForChanges = median(leadTimes);

  // Change failure rate.
  const changeFailureRate = resolved.length ? (failures.length / resolved.length) * 100 : null;

  // Time to restore: a failed deploy until the next successful one.
  const restoreTimes = [];
  for (const failure of failures) {
    const recovery = successes.find((s) => s.at > failure.at);
    if (recovery) restoreTimes.push((recovery.at - failure.at) / HOUR);
  }
  // No deployments at all means no measurement. No failures across real
  // deployments genuinely is zero, and should not be reported as unknown.
  let timeToRestore = null;
  if (resolved.length > 0) timeToRestore = failures.length === 0 ? 0 : median(restoreTimes);

  // Deployment counts for every environment, for the summary block.
  const byEnvironment = {};
  for (const envName of ['dev', 'qa', 'production']) {
    const list = await collectDeployments(envName);
    byEnvironment[envName] = list.filter((d) => new Date(d.created_at).getTime() >= since).length;
  }

  const metrics = {
    deploymentFrequency: {
      value: round(deploymentFrequency),
      unit: 'per week',
      band: band('deploymentFrequency', deploymentFrequency),
    },
    leadTimeForChanges: {
      value: round(leadTimeForChanges),
      unit: 'hours',
      band: band('leadTimeForChanges', leadTimeForChanges),
    },
    changeFailureRate: {
      value: round(changeFailureRate),
      unit: '%',
      band: band('changeFailureRate', changeFailureRate),
    },
    timeToRestore: {
      value: round(timeToRestore),
      unit: 'hours',
      band: band('timeToRestore', timeToRestore),
    },
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    windowDays: WINDOW_DAYS,
    repo: REPO,
    metrics,
    deployments: {
      total: resolved.length,
      successful: successes.length,
      failed: failures.length,
      byEnvironment,
    },
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Wrote ${OUT}`);
  console.log(
    `  window            ${WINDOW_DAYS} days`,
    `\n  prod deployments  ${resolved.length} (${successes.length} ok, ${failures.length} failed)`,
    `\n  deploy frequency  ${metrics.deploymentFrequency.value ?? 'n/a'} per week`,
    `\n  lead time         ${metrics.leadTimeForChanges.value ?? 'n/a'} hours`,
    `\n  change failure    ${metrics.changeFailureRate.value ?? 'n/a'} %`,
    `\n  time to restore   ${metrics.timeToRestore.value ?? 'n/a'} hours`
  );
}

main().catch((err) => {
  console.error(`DORA calculation failed: ${err.message}`);
  process.exit(1);
});
