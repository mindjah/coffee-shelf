import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { linkInfo, URL_IN_TEXT } from '../links'
import { useT } from '../i18n'
import { usePendingPlaces, withPlaceName } from '../placeNames'

/**
 * Text with its web addresses shown by name (see links.ts); links open outside the app. A map link
 * that doesn't say which place (a short share link) gets a button to name it.
 */
function NoteText({ text, pending, onName }: { text: string; pending: Set<string>; onName: (raw: string, href: string, name: string) => void }) {
  const t = useT()
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(URL_IN_TEXT)) {
    const start = m.index ?? 0
    const link = m[2] ? linkInfo(m[2], m[1]) : linkInfo(m[0])
    parts.push(text.slice(last, start))
    const looking = !m[2] && pending.has(link.href)
    parts.push(
      <a key={start} href={link.href} target="_blank" rel="noopener noreferrer" className="note-link" title={m[2] ?? m[0]} onClick={(e) => e.stopPropagation()}>
        {link.map ? '📍' : '🔗'} {looking ? t.coffee.findingPlace : link.label}
      </a>,
    )
    if (link.map && !link.named && !looking) {
      parts.push(
        <button
          key={`name-${start}`}
          type="button"
          className="note-name"
          onClick={(e) => {
            e.stopPropagation()
            const name = prompt(t.coffee.namePlacePrompt)?.trim()
            if (name) onName(m[0], link.href, name)
          }}
        >
          ✎ {t.coffee.namePlace}
        </button>,
      )
    }
    last = start + m[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}

/**
 * Your notes on a coffee. While you type it's a box that grows with the text; otherwise the notes
 * read as text with links named for what they are ("📍 Café Bar · Google Maps"). Tap the text to edit.
 */
export function NoteField({ value, placeholder, onChange, onDone }: {
  value: string
  placeholder: string
  onChange: (v: string) => void
  /** Called with the text when you leave the field or name a link, e.g. to save. */
  onDone?: (value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const box = useRef<HTMLTextAreaElement>(null)

  // Unnamed map links are named in the background once the note is saved (see placeNames.ts).
  const pending = usePendingPlaces()
  const latest = useRef({ value, onChange, onDone })
  latest.current = { value, onChange, onDone }
  const nameLink = (raw: string, _href: string, name: string) => {
    const next = withPlaceName(latest.current.value, raw, name)
    latest.current.onChange(next)
    latest.current.onDone?.(next)
  }

  // Grow (or shrink) to fit everything typed, no inner scrolling.
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value, editing])
  useEffect(() => {
    if (editing) box.current?.focus()
  }, [editing])

  if (!editing && value.trim()) {
    return (
      <div className="input note-view" role="button" tabIndex={0} onClick={() => setEditing(true)} onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}>
        <NoteText text={value} pending={pending} onName={nameLink} />
      </div>
    )
  }
  return (
    <textarea
      ref={box}
      className="input note-edit"
      placeholder={placeholder}
      value={value}
      rows={2}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setEditing(true)}
      onBlur={(e) => (setEditing(false), onDone?.(e.target.value))}
    />
  )
}
