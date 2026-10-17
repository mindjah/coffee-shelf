// Keeps the recommender's weights tuned to your ratings: re-tuned in a worker whenever ratings or
// the rated coffees change, and remembered between launches so predictions use them right away.
import { useEffect, useState } from 'react'
import type { Accuracy, Params } from './recommend'
import type { Coffee } from './types'

const KEY = 'coffee-shelf.tuning'

interface Tuned {
  /** What the weights were tuned on; a different shelf means tuning again. */
  signature: string
  params: Params
  accuracy: Accuracy | null
}

function load(): Tuned | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null')
  } catch {
    return null
  }
}

/** Rated coffees without photos: everything predictions depend on, and nothing heavy. */
function ratedData(coffees: Coffee[]): Coffee[] {
  return coffees.filter((c) => c.rating != null).map((c) => ({ ...c, photo: undefined }))
}

export function useTuning(coffees: Coffee[] | undefined): Tuned | null {
  const [tuned, setTuned] = useState<Tuned | null>(load)
  useEffect(() => {
    if (!coffees) return
    const data = ratedData(coffees)
    const signature = JSON.stringify(data.map(({ createdAt, ratedAt, comment, photo, archivedAt, ...c }) => c))
    if (tuned?.signature === signature) return
    // Waits for a pause in edits (e.g. tapping through stars) before starting.
    let worker: Worker | undefined
    const timer = setTimeout(() => {
      worker = new Worker(new URL('./tune.worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (e: MessageEvent<Omit<Tuned, 'signature'>>) => {
        const next = { signature, ...e.data }
        setTuned(next)
        try {
          localStorage.setItem(KEY, JSON.stringify(next))
        } catch {
          // Tuned again next launch.
        }
        worker?.terminate()
      }
      worker.postMessage(data)
    }, 1500)
    return () => (clearTimeout(timer), worker?.terminate())
  }, [coffees, tuned?.signature])
  return tuned
}
