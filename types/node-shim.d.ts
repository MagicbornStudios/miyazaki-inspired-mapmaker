declare module 'node:fs/promises' {
  type PathLike = string | URL | number;

  export function mkdir(path: PathLike, options?: { recursive?: boolean }): Promise<void>;
  export function readFile(path: PathLike, options: { encoding: 'utf8' } | 'utf8'): Promise<string>;
  export function readFile(path: PathLike): Promise<Buffer>;
  export function writeFile(
    path: PathLike,
    data: string | Uint8Array,
    options?: { encoding?: string } | string
  ): Promise<void>;
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function relative(from: string, to: string): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
  export class URL {
    constructor(input: string, base?: string | URL);
  }
}

declare namespace NodeJS {
  interface ErrnoException extends Error {
    code?: string;
  }
}

declare const process: {
  argv: string[];
  exit(code?: number): never;
};

declare class Buffer {}
