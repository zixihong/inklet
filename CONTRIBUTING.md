# Contributing to Inklet

Thanks for your interest. Inklet is a CLI, a visual region editor, and a React component, all in the same NPM package. Contributions of all sizes are welcome: bug fixes, new features, docs, examples.

## Ways to help

- **Found a bug?** [Open an issue](https://github.com/zixihong/inklet/issues/new/choose) with steps to reproduce. Even a one-line "this is broken" is fine — we'll help narrow it down.
- **Have an idea for a feature?** [Open a feature request](https://github.com/zixihong/inklet/issues/new/choose) and describe what you're trying to build. For non-trivial changes, please open the issue *before* writing code so we can align on the approach.
- **Found a typo or unclear doc?** Just send a PR. No issue needed.
- **Want to help with examples or screenshots?** PRs to `docs/` and the README are very welcome.

## Local development

```bash
# 1. Clone and install
git clone https://github.com/zixihong/inklet.git
cd inklet
npm install

# 2. Build (compiles src/ → dist/)
npm run build

# 3. Try the CLI on a test image
node dist/bin/cli.js path/to/your-image.jpg -w 100
```

The editor will open in your browser. Paint a region, save, and you'll see `ascii-config.json` written to the current directory.

### Testing changes against a React app

The fastest way to test the React component locally is `npm link`:

```bash
# In the inklet repo
npm run build
npm link

# In a separate React/Next.js/Vite project
npm link inklet
```

Then `import { AsciiImage } from 'inklet/react'` will resolve to your local working copy. Re-run `npm run build` in the inklet repo whenever you change something — the linked consumer picks it up automatically.

When you're done, `npm unlink inklet` in the consumer and `npm unlink` in the inklet repo.

## Project structure

```
src/
├── color.ts         # palette dedup, hex helpers
├── editor/          # the in-browser visual region editor
│   ├── server.ts    # local HTTP server that serves template.html
│   └── template.html # the editor UI (HTML/CSS/JS — no build step)
├── generate.ts      # image → ASCII conversion (uses sharp)
├── index.ts         # public exports
├── ramps.ts         # character density ramps
├── react/           # React component + hooks (built separately)
│   ├── AsciiImage.tsx
│   ├── index.ts
│   └── use-ascii-spans.ts
├── regions.ts       # run-length encoding, region map building
├── segment.ts       # automatic flood-fill segmentation (used optionally)
└── types.ts         # shared types
bin/
└── cli.ts           # CLI entry point — argument parsing, dispatch
```

If you're not sure where something lives, ask in your issue and we'll point you at the right file.

## Code style

There's no formal linter set up yet. Just match the surrounding code:

- TypeScript strict mode is on — no `any` if you can help it
- 2-space indentation, single quotes, no semicolons (look at any `.ts` file for the pattern)
- Function-style React components, hooks for state
- The editor (`src/editor/template.html`) is plain HTML/CSS/JS on purpose — no framework, no build step. Keep it that way.

## Pull requests

- One topic per PR — easier to review and revert
- Reference any related issue in the PR description (`Fixes #42`)
- For UI changes to the editor, please attach a before/after screenshot
- Tests are not required (yet), but if you're touching `regions.ts`, `color.ts`, or `ramps.ts`, a small `vitest` test for the function you changed is a great bonus

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) — the same license as the rest of the project.
