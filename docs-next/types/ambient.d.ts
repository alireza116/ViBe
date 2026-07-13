declare module '*.css';

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@vibe' {
  export const Elicit: any;
  export const plot: any;
  export const edit: any;
  export const when: any;
  export const constraints: any;
  export const guides: any;
  export const widgets: any;
  export const format: any;
  export const D3Renderer: any;
}
