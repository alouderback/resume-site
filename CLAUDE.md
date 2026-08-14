# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Alex Louderback's resume site. It is also a working demonstration of a
three-environment CI/CD pipeline, so the pipeline is part of the product. Treat
`.github/workflows/` and `scripts/` as first-class code, not scaffolding.

## Non-negotiables

**`withBase()` on every internal link and asset.** Import it from
`src/lib/paths.ts`. Astro does not prefix hrefs with the configured `base`, and
Sandbox and Test are both served from subdirectories. `npm run links` catches
violations, so run it before claiming a change works.

**`site.config.mjs` is the single source of truth** for origin, path prefix, and
the environment table. Never hardcode a URL or a base path anywhere else. The
Astro config, the path helper, the deploy workflow, and the publish script all
derive from it.

**Environment differences live in `src/lib/flags.ts`.** Add a flag to the matrix
rather than writing `ENV.key === 'dev'` inline.

**Two colour roles, and they are not interchangeable.** `--brand` is Eagles
kelly green and is the site's identity: links, buttons, focus rings, list
markers, anything that should look the same in every environment. `--accent` is
the deployment environment (Sandbox violet, Test amber, Production kelly green)
and belongs only on environment chrome: the environment banner, the org
switcher, the build panel, the "you are here" row, and the Sandbox-only Lab
block. Reaching for `--accent` on ordinary UI makes Production look like a
Sandbox, and makes the environment signal meaningless.

**Resume content lives in `src/data/`** as typed modules. Pages render from data.

## Writing voice

Site copy follows strict rules. Read the Writing voice section of
`CONTRIBUTING.md` before writing or editing any user-facing text. The short
version: no em dashes, no "not X, it's Y" constructions, no marketing or LLM
vocabulary, short declarative sentences.

## Commands

```bash
npm run dev          # Sandbox at localhost:4321/resume-site/dev/
npm run build:all    # all three environments into dist/<env>/
npm run check        # lint, format check, typecheck
npm run links        # internal link and asset check over dist/
```

Always run `npm run check` and `npm run build:all` before finishing a change.
`npm run links` needs a build first.

## Branching

Work branches from `dev` as `feature/*` or `fix/*`. Never commit directly to
`qa` or `main`. Promotion between environments happens through the `promote.yml`
workflow, which opens a pull request.

## Gotchas

- `dist/` is per-environment: `dist/dev/`, `dist/qa/`, `dist/prod/`. The
  `outDir` in `astro.config.mjs` is derived from `ENV_NAME`.
- `src/data/dora.json` is a build-time fallback snapshot. The live file is
  published to the `gh-pages` root by `dora.yml` and fetched at runtime. Do not
  hand-edit either one with real-looking numbers.
- The `secrets` context is not available in a job-level `if`. Gate optional
  workflows on a preceding job that reads the secret into an output, the way
  `agentic-review.yml` does.
- Pull requests opened by `GITHUB_TOKEN` do not trigger other workflows. This is
  why promotion PRs do not run CI unless a `PROMOTE_TOKEN` is configured.
