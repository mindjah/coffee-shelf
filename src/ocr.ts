import { createWorker } from 'tesseract.js'
import { ScanError } from './errors'

export interface OcrProgress {
  /** "loading" covers the one-time download of the engine and language files (~10 MB). */
  stage: 'loading' | 'reading'
  /** 0–1 across all photos. */
  progress: number
}

/** Recognises English, Spanish and Russian text on the phone; nothing leaves the device. */
export async function recognize(images: Blob[], onProgress: (p: OcrProgress) => void): Promise<string> {
  let current = 0
  let worker
  try {
    worker = await createWorker(['eng', 'spa', 'rus'], 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') onProgress({ stage: 'reading', progress: (current + m.progress) / images.length })
        else onProgress({ stage: 'loading', progress: m.progress })
      },
    })
  } catch {
    // The engine and language files come from a CDN the first time.
    throw new ScanError('ocrDownload')
  }
  try {
    const texts: string[] = []
    for (const [i, img] of images.entries()) {
      current = i
      texts.push((await worker.recognize(img)).data.text)
    }
    const text = texts.join('\n').trim()
    if (text.replace(/[^\p{L}]/gu, '').length < 4) throw new ScanError('unreadable')
    return text
  } finally {
    await worker.terminate()
  }
}
