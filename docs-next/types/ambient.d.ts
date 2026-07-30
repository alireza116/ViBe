declare module '*.css';

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// `@elicit` resolves via tsconfig paths → ../src/index.js, which picks up
// ../src/index.d.ts. Do not re-declare the module here as `any` — that
// kills IntelliSense for Elicit / plot / edit.
