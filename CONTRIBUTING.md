# Contributing to Crawlix

Contributions are welcome - bug fixes, new agents, adapter improvements, or anything that makes it better.

## Getting started

```bash
git clone https://github.com/m-taqii/crawlix
cd crawlix
pnpm install
pnpm tsx src/cli/index.ts run --url https://example.com --goal "find the more information link"
```

## Ways to contribute

- **Add a built-in agent** - add a persona to `src/personas/index.ts` and open a PR
- **Fix a bug** - open an issue first, then a PR with the fix
- **Improve element resolution** - `src/adapters/web.ts` `resolve()` method always needs work
- **Add an adapter** - API testing, mobile, desktop - see `src/adapters/base.ts` for the interface
- **Improve the report** - `src/core/reporter.ts` - better prompts, better structure

## Before opening a PR

- Run `pnpm exec tsc --noEmit` - must be clean
- Test against a real URL
- Keep it focused - one thing per PR

## Found a bug?

Open an issue with the URL you were testing, the goal you gave, and the error output.
