import { useEffect, useRef, type RefObject } from 'react'

/**
 * Swipe navigation, as in iOS apps:
 * - with a screen open (a Sheet), swiping right goes back: the screen follows your finger and closes,
 *   which returns to the one under it (or the main screen);
 * - otherwise swiping left or right moves to the next or previous tab of the bottom bar.
 * Swipes that start on something that scrolls sideways, a text field, the rating stars or the
 * photo viewer are left to it.
 */

/** Open screens and how each goes back; the last one in the document is on top. */
const screens = new Map<HTMLElement, () => void>()

/** Lets a sheet be swiped away; `onBack` is what its back/close button does. */
export function useSwipeBack(ref: RefObject<HTMLElement | null>, onBack: () => void) {
  const latest = useRef(onBack)
  latest.current = onBack
  useEffect(() => {
    const el = ref.current
    if (!el) return
    screens.set(el, () => latest.current())
    return () => void screens.delete(el)
  }, [ref])
}

const topScreen = () => {
  let top: HTMLElement | undefined
  for (const el of screens.keys()) {
    if (el.isConnected && (!top || top.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) top = el
  }
  return top
}

const IGNORE = 'input, textarea, select, [contenteditable], .stars.rateable, .viewer'

/** Touches that something else should handle: fields, stars, photos, or a strip that scrolls sideways. */
function claimed(target: EventTarget | null, until: Element) {
  for (let el = target as Element | null; el && el !== until; el = el.parentElement) {
    if (el.matches(IGNORE)) return true
    if (el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(el).overflowX)) return true
  }
  return false
}

const LOCK = 10 // px before deciding whether a touch is a sideways swipe
const ease = 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease'

/** Installs the swipes; `onTab(+1)` is the next tab, `onTab(-1)` the previous one. */
export function useSwipeNavigation(onTab: (step: 1 | -1) => boolean) {
  const latest = useRef(onTab)
  latest.current = onTab

  useEffect(() => {
    let start: { x: number; y: number; t: number } | null = null
    let mode: 'back' | 'tab' | 'none' | null = null
    let el: HTMLElement | null = null
    let backdrop: HTMLElement | null = null
    let dx = 0

    const reset = () => ((start = null), (mode = null), (el = null), (backdrop = null), (dx = 0))

    const onStart = (e: TouchEvent) => {
      reset()
      if (e.touches.length !== 1) return
      const sheet = topScreen()
      const page = sheet ? null : document.querySelector<HTMLElement>('.tab-page:not([hidden])')
      el = sheet ?? page
      if (!el || claimed(e.target, document.body)) return void (el = null)
      // A sheet inside a sheet: its parent is under it, not part of it.
      if (sheet && !sheet.contains(e.target as Node)) return void (el = null)
      backdrop = sheet?.previousElementSibling?.classList.contains('sheet-backdrop') ? (sheet.previousElementSibling as HTMLElement) : null
      const p = e.touches[0]
      start = { x: p.clientX, y: p.clientY, t: e.timeStamp }
    }

    const onMove = (e: TouchEvent) => {
      if (!start || !el || mode === 'none') return
      const p = e.touches[0]
      dx = p.clientX - start.x
      const dy = p.clientY - start.y
      if (!mode) {
        if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK) return
        // Mostly sideways; anything else is a scroll and left alone.
        if (Math.abs(dx) < Math.abs(dy) * 1.5) return void (mode = 'none')
        mode = screens.has(el) ? 'back' : 'tab'
        if (mode === 'back' && dx < 0) return void (mode = 'none')
        el.style.transition = 'none'
        if (backdrop) backdrop.style.transition = 'none'
      }
      if (e.cancelable) e.preventDefault()
      const w = window.innerWidth
      if (mode === 'back') {
        const x = Math.max(0, dx)
        el.style.transform = `translateX(${x}px)`
        el.style.boxShadow = '-8px 0 24px rgba(0, 0, 0, 0.12)'
        if (backdrop) backdrop.style.opacity = String(1 - x / w)
      } else {
        // The page leans the way you swipe; it changes when you let go.
        el.style.transform = `translateX(${dx * 0.35}px)`
        el.style.opacity = String(1 - Math.min(0.4, Math.abs(dx) / w))
      }
    }

    const settle = (target: HTMLElement, transform = '', opacity = '') => {
      target.style.transition = ease
      target.style.transform = transform
      target.style.opacity = opacity
      const clear = () => {
        target.style.transition = ''
        target.style.boxShadow = ''
      }
      target.addEventListener('transitionend', clear, { once: true })
      setTimeout(clear, 300)
    }

    const onEnd = (e: TouchEvent) => {
      const target = el
      const back = backdrop
      if (!start || !target || (mode !== 'back' && mode !== 'tab')) return reset()
      const w = window.innerWidth
      const fast = Math.abs(dx) / Math.max(1, e.timeStamp - start.t) > 0.5 && Math.abs(dx) > 40
      if (mode === 'back') {
        const close = screens.get(target)
        if (close && (dx > w * 0.33 || (fast && dx > 0))) {
          settle(target, 'translateX(100%)')
          if (back) settle(back, '', '0')
          setTimeout(() => {
            close()
            // Went back inside the same screen (e.g. a chapter → contents): it slides back in.
            requestAnimationFrame(() => {
              if (!target.isConnected) return
              target.style.transition = 'none'
              target.style.transform = 'translateX(-25%)'
              target.style.opacity = '0'
              requestAnimationFrame(() => settle(target))
              if (back) back.style.opacity = ''
            })
          }, 200)
        } else {
          settle(target)
          if (back) settle(back)
        }
      } else {
        const step = dx < 0 ? 1 : -1
        if (Math.abs(dx) > 70 || fast) {
          target.style.transition = 'none'
          target.style.transform = ''
          target.style.opacity = ''
          if (!latest.current(step)) settle(target)
        } else {
          settle(target)
        }
      }
      reset()
    }

    const opts = { passive: false } as const
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, opts)
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', onEnd)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [])
}
