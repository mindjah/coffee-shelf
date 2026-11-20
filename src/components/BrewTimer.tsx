import { useEffect, useRef, useState } from 'react'
import type { Article } from '../encyclopedia/types'
import { useT } from '../i18n'
import { Sheet } from './Sheet'

type Status = 'ready' | 'running' | 'paused' | 'done'

interface Run {
  status: Status
  index: number
  /** When the clock started: the first timed step. Null while only prep steps have been done. */
  clockStart: number | null
  stepStart: number
  pausedAt: number | null
  endedAt: number | null
}

const fresh: Run = { status: 'ready', index: 0, clockStart: null, stepStart: 0, pausedAt: null, endedAt: null }

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** A short two-tone chime when a step changes; silent where Web Audio isn't allowed. */
function chime(ctx: AudioContext | null) {
  navigator.vibrate?.(200)
  if (!ctx) return
  if (ctx.state !== 'running') ctx.resume().catch(() => {})
  const t = ctx.currentTime
  for (const [i, f] of [880, 1320].entries()) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = f
    g.gain.setValueAtTime(0.0001, t + i * 0.16)
    g.gain.exponentialRampToValueAtTime(0.3, t + i * 0.16 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.16 + 0.35)
    o.connect(g).connect(ctx.destination)
    o.start(t + i * 0.16)
    o.stop(t + i * 0.16 + 0.4)
  }
}

/**
 * A brew recipe as a full-screen, step-by-step guide. Timed steps count down and move on by
 * themselves (with a chime), so pours land on time; the rest wait for Next step. Times come from
 * Date.now(), so the clock stays right even when the browser throttles timers.
 */
/** `onDone`: brewing for a coffee from the shelf; after brewing, its button goes back to that coffee. */
export function BrewTimer({ article, onClose, onDone }: { article: Article; onClose: () => void; onDone?: { label: string; go: () => void } }) {
  const t = useT()
  const steps = article.steps ?? []
  const timer = article.timer ?? []
  const [run, setRun] = useState<Run>(fresh)
  const [now, setNow] = useState(() => Date.now())
  const audio = useRef<AudioContext | null>(null)
  const list = useRef<HTMLOListElement>(null)

  const live = run.status === 'running'
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [live])

  // Keep the screen on while brewing, where the browser allows it.
  const active = run.status === 'running' || run.status === 'paused'
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | undefined
    let gone = false
    navigator.wakeLock.request('screen').then((l) => {
      if (gone) void l.release()
      else lock = l
    }).catch(() => {})
    return () => {
      gone = true
      lock?.release().catch(() => {})
    }
  }, [active])

  useEffect(() => () => void audio.current?.close().catch(() => {}), [])

  /**
   * Audio that plays, set up inside a tap (iOS only allows that). `fresh` replaces the context:
   * every brew starts with a new one, and after the app was in the background iOS can keep the old
   * one suspended or silent even when it says it's running.
   */
  const unlock = (fresh = false) => {
    const old = audio.current
    if (!fresh && old && old.state === 'running') return
    void old?.close().catch(() => {})
    try {
      const ctx = new AudioContext()
      ctx.resume().catch(() => {})
      // Playing something inside the tap is what unlocks audio on iOS.
      const src = ctx.createBufferSource()
      src.buffer = ctx.createBuffer(1, 1, 22050)
      src.connect(ctx.destination)
      src.start()
      audio.current = ctx
    } catch {
      audio.current = null
    }
    setMuted(false)
  }

  // Back from the background mid-brew: try to wake the sound at once; if iOS won't, say so, and the
  // next tap anywhere brings it back.
  const [muted, setMuted] = useState(false)
  const stale = useRef(false)
  useEffect(() => {
    if (!active) return
    const onShow = () => {
      if (document.visibilityState !== 'visible') return void (stale.current = true)
      const ctx = audio.current
      ctx?.resume().catch(() => {})
      setTimeout(() => ctx && audio.current === ctx && ctx.state !== 'running' && setMuted(true), 400)
    }
    const onTap = () => {
      if (!stale.current && audio.current?.state === 'running') return
      stale.current = false
      unlock(true)
    }
    document.addEventListener('visibilitychange', onShow)
    document.addEventListener('pointerdown', onTap, true)
    return () => {
      document.removeEventListener('visibilitychange', onShow)
      document.removeEventListener('pointerdown', onTap, true)
    }
  }, [active])

  /** Moves to step `i`, which began at `at` (a timed step ends exactly on time, not at the tick). */
  const goTo = (r: Run, i: number, at: number): Run => {
    if (i >= steps.length) return { ...r, status: 'done', endedAt: at }
    return { ...r, status: 'running', index: i, stepStart: at, clockStart: r.clockStart ?? (timer[i] != null ? at : null) }
  }

  // A timed step that has run out hands over to the next one.
  const dur = timer[run.index]
  useEffect(() => {
    if (run.status !== 'running' || dur == null) return
    const end = run.stepStart + dur * 1000
    if (now >= end) {
      setRun((r) => goTo(r, r.index + 1, end))
      // Several steps that ran out while the app was away chime once, not all at the same moment.
      if (Date.now() - end < 2000) chime(audio.current)
    }
  }, [now, run, dur])

  useEffect(() => {
    if (run.status === 'ready') return
    list.current?.children[run.index]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [run.index, run.status])

  const start = () => {
    unlock(true)
    const at = Date.now()
    setNow(at)
    setRun(goTo(fresh, 0, at))
  }
  const next = () => {
    const at = Date.now()
    setNow(at)
    setRun((r) => goTo(r, r.index + 1, at))
    if (run.index + 1 < steps.length) chime(audio.current)
  }
  const pause = () => setRun((r) => ({ ...r, status: 'paused', pausedAt: Date.now() }))
  const resume = () => {
    const at = Date.now()
    setNow(at)
    setRun((r) => {
      const shift = at - (r.pausedAt ?? at)
      return { ...r, status: 'running', pausedAt: null, stepStart: r.stepStart + shift, clockStart: r.clockStart == null ? null : r.clockStart + shift }
    })
  }

  const at = run.endedAt ?? run.pausedAt ?? now
  const elapsed = run.clockStart == null ? 0 : at - run.clockStart
  const left = dur == null ? 0 : run.stepStart + dur * 1000 - at
  const last = run.index === steps.length - 1
  const facts = article.facts ?? []
  // The bar holds the method ("V60"); the full recipe name heads the page.
  const [method] = article.title.split(' — ')

  return (
    <Sheet title={method} onClose={onClose} closeLabel={`‹ ${t.book.back}`}>
      {run.status === 'done' ? (
        <div className="brew-done">
          <div className="brew-clock">{run.clockStart == null ? '✓' : clock(elapsed)}</div>
          <h2>{t.brewing.done}</h2>
          {run.clockStart != null && <p className="muted">{t.brewing.brewedIn(clock(elapsed))}</p>}
          <button className="btn block" onClick={() => setRun(fresh)}>{t.brewing.again}</button>
          {onDone ? (
            <button className="btn plain block" onClick={onDone.go}>{onDone.label}</button>
          ) : (
            <button className="btn plain block" onClick={onClose}>{t.book.back}</button>
          )}
        </div>
      ) : (
        <>
          <h2 className="book-chapter-title brew-title">{article.title}</h2>
          {facts.length > 0 && (
            <dl className="article-facts brew-facts">
              {facts.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}
          <div className={`brew-dial${run.clockStart == null ? ' idle' : ''}`}>
            <div className="brew-clock">{clock(elapsed)}</div>
            <div className="brew-status">
              {run.status === 'ready' ? t.brewing.ready : dur != null ? t.brewing.nextIn(clock(left + 999)) : t.brewing.ownPace}
            </div>
            {run.status !== 'ready' && dur != null && (
              <div className="brew-bar"><span style={{ width: `${Math.min(100, (1 - left / (dur * 1000)) * 100)}%` }} /></div>
            )}
            {muted && active && (
              <button type="button" className="brew-sound" onClick={() => unlock(true)}>{t.brewing.soundOff}</button>
            )}
          </div>
          <ol className="brew-steps" ref={list}>
            {steps.map((s, i) => {
              const state = run.status === 'ready' ? '' : i < run.index ? 'past' : i === run.index ? 'now' : ''
              return (
                <li key={i} className={state}>
                  <span className="brew-step-num">{state === 'past' ? '✓' : i + 1}</span>
                  <span className="brew-step-text">
                    {state === 'now' && <span className="brew-step-of">{t.brewing.step(i + 1, steps.length)}</span>}
                    {s}
                  </span>
                  {timer[i] != null && <span className="brew-step-time">{clock(timer[i]! * 1000)}</span>}
                </li>
              )
            })}
          </ol>
          <div className="brew-controls">
            {run.status === 'ready' ? (
              <button className="btn block" onClick={start}>{t.brewing.go}</button>
            ) : (
              <>
                <button className="btn ghost" onClick={run.status === 'paused' ? resume : pause}>
                  {run.status === 'paused' ? t.brewing.resume : t.brewing.pause}
                </button>
                <button className="btn" style={{ flex: 1 }} onClick={next} disabled={run.status === 'paused'}>
                  {last ? t.brewing.finish : t.brewing.next}
                </button>
              </>
            )}
          </div>
          {run.status !== 'ready' && (
            <button className="btn plain block" onClick={() => setRun(fresh)}>{t.brewing.restart}</button>
          )}
        </>
      )}
    </Sheet>
  )
}
