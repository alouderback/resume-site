# Contributing

## Branching

Three long-lived branches, one per environment. They are never deleted and never
force-pushed.

| Branch | Environment | Accepts                  |
| ------ | ----------- | ------------------------ |
| `dev`  | Sandbox     | Feature and fix branches |
| `qa`   | Test        | Promotion PRs from `dev` |
| `main` | Production  | Promotion PRs from `qa`  |

Feature branches are named `feature/short-description` or `fix/short-description`
and always branch from `dev`.

Promotion never happens by pushing directly. Run the **Promote** workflow, which
opens a pull request showing exactly which commits are moving up.

## Before opening a pull request

```bash
npm run check       # lint, format, typecheck
npm run build:all   # all three environments must build
npm run links       # every internal reference must resolve
```

## Rules that the review will check

**Internal links go through `withBase()`.** Astro does not rewrite hrefs for the
configured base path. A bare `/experience/` works in Production and 404s in
Sandbox and Test.

```jsx
import { withBase } from '../lib/paths';

// Correct: resolves under whichever base the environment is served from.
<a href={withBase('/experience/')}>Experience</a>;

// Broken in Sandbox and Test: hardcodes the Production path.
<a href="/experience/">Experience</a>;
```

**Environment differences go in `src/lib/flags.ts`.** Add the flag to the matrix
and read it with `flag('name')`. Do not scatter `ENV.key === 'dev'` checks
through components.

**Resume content goes in `src/data/`.** Typed modules, one per area. Pages render
from data so nothing drifts between environments.

**Use the right colour token.** `--brand` (Eagles kelly green) is the site
identity and looks the same everywhere. `--accent` is the deployment environment
and belongs only on environment chrome: the banner, org switcher, build panel,
and the Sandbox-only Lab block. Using `--accent` for ordinary UI would repaint
Production in Sandbox violet and destroy the environment signal.

**Adding something to Things I'm Into** is one entry in `src/data/interests.ts`.
Drop a cover image into `public/covers/` and reference it with the `cover` field,
or leave `cover` out and the carousel renders a generated typographic card in the
same aspect ratio.

## Writing voice

Site copy is written to sound like a working engineer, not like marketing and
not like a language model. These are enforced in review.

- **No em dashes.** Use commas, periods, or parentheses. En dashes only inside
  numeric ranges.
- **No antithesis constructions.** Avoid "not just X, it's Y", "isn't about X,
  it's about Y", "more than X, it's Y". If a sentence pivots on a negation for
  rhythm, rewrite it.
- **No LLM vocabulary.** Avoid: leverage, delve, seamless, robust, elevate,
  unlock, streamline, empower, testament, landscape, realm, tapestry, journey,
  deep dive, game-changer, cutting-edge, best-in-class.
- **No adjective triads** used for cadence, such as "fast, reliable, and
  scalable".
- **No hype adverbs**: incredibly, remarkably, seamlessly, dramatically.
- **No rhetorical-question headings**, and no sentence opening with "Whether
  you're".
- Short declarative sentences. Active voice. Concrete numbers rather than
  adjectives.

Resume bullets stay close to the wording on the PDF, because that wording is
already Alex's.

## Accessibility

- Semantic elements before ARIA.
- Alt text on every meaningful image. Decorative images get `aria-hidden`.
- Visible focus states. The global `:focus-visible` rule handles most of it.
- Check contrast in both light and dark themes. The theme toggle is in the nav.
- Anything interactive must work from the keyboard, including the carousel.
