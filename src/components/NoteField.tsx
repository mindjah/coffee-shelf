import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { linkInfo, URL_IN_TEXT } from '../links'
import { useT } from '../i18n'

/**
 * Text with its web addresses shown by name (see links.ts); links open outside the app. A map link
 * that doesn't say which place (a short share link) gets a button to name it.
 */
function NoteText({ text, onName }: { text: string; onName: (raw: string, href: string, name: string) => void }) {
  const t = useT()
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(URL_IN_TEXT)) {
    const start = m.index ?? 0
    const link = m[2] ? linkInfo(m[2], m[1]) : linkInfo(m[0])
    parts.push(text.slice(last, start))
    parts.push(
      <a key={start} href={link.href} target="_blank" rel="noopener noreferrer" className="note-link" title={m[2] ?? m[0]} onClick={(e) => e.stopPropagation()}>
        {link.map ? '📍' : '🔗'} {link.label}
      </a>,
    )
    if (link.map && !link.named) {
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
        <NoteText
          text={value}
          onName={(raw, href, name) => {
            // Stored as "[name](link)": the link keeps working and reads by its name from now on.
            const next = value.replace(raw, `[${name.replace(/[[\]]/g, '')}](${href})`)
            onChange(next)
            onDone?.(next)
          }}
        />
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
