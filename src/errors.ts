export type ScanErrorCode = 'noKey' | 'badKey' | 'rateLimit' | 'offline' | 'api' | 'refusal' | 'truncated' | 'unreadable' | 'notCoffee' | 'noModel' | 'ocrDownload' | 'timeout' | 'noCredit'

/** Carries a code the UI translates; `detail` is untranslated API text, shown after it. */
export class ScanError extends Error {
  constructor(public code: ScanErrorCode, public detail?: string) {
    super(detail ? `${code}: ${detail}` : code)
  }
}
