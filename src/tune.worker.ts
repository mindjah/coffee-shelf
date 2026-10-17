// Tunes the recommender off the main thread: a few hundred leave-one-out passes take a moment
// on a phone, and the app shouldn't stutter while they run.
import { tune } from './recommend'
import type { Coffee } from './types'

self.onmessage = (e: MessageEvent<Coffee[]>) => {
  self.postMessage(tune(e.data))
}
