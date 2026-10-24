import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { linkInfo, URL_IN_TEXT } from '../links'

/** Text with its web addresses shown by name (see links.ts); links open outside the app. */
function NoteText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(URL_IN_TEXT)) {
    const start = m.index ?? 0
    const link = linkInfo(m[0])
    parts.push(text.slice(last, start))
    parts.push(
      <a key={start} href={link.href} target="_blank" rel="noopener noreferrer" className="note-link" title={m[0]} onClick={(e) => e.stopPropagation()}>
        {link.map ? '📍' : '🔗'} {link.label}
      </a>,
    )
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
  /** Called when you leave the field, e.g. to save. */
  onDone?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const box = useRef<HTMLTextAreaElement>(null)

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
        <NoteText text={value} />
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
      onBlur={() => (setEditing(false), onDone?.())}
    />
  )
}
