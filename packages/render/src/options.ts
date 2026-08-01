/**
 * A media handle is only obtainable from the Resumable Upload API, so
 * compilation is async from the first release even though v1 never performs a
 * network call (ADR-0004).
 */
export interface Uploader {
  /** Returns the `4::aW…` handle a create payload's `example` needs. */
  upload(asset: MediaAsset): Promise<string>
}

export interface MediaAsset {
  readonly path: string
}

export interface CompileOptions {
  /** Injected when media headers exist. Unused in v1. */
  readonly uploader?: Uploader
}

/** The uploader used when the caller supplies none. Never called in v1. */
export const unavailableUploader: Uploader = {
  upload() {
    return Promise.reject(
      new Error('No uploader was provided. Pass one as { uploader } to compile media headers.'),
    )
  },
}
