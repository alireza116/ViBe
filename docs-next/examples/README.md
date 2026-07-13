# Docs examples

Each example is a pair of files:

| File | Role |
|------|------|
| `slug.example.txt` | **Source of truth** — plain chart body (`mount(Elicit({…}))`). Edit this in the IDE. |
| `slug.tsx` | Meta + `import code from './slug.example.txt'` + default `<ExampleLive />` wrapper. |

The `.txt` extension keeps webpack/Turbopack from parsing chart bodies as JS modules (which would inject dev HMR / `import.meta` into the eval string).

## Dev workflow

1. Run `npm run dev:docs-next`
2. Edit any `*.example.txt` and save
3. Next HMR reloads the sibling module; the live chart and code pane update

Website visitors can still edit the code string in the browser (eval path). Reset restores the file contents.

## Migrating legacy `{ meta, code }` modules

```bash
npm run migrate:examples-to-tsx
```
