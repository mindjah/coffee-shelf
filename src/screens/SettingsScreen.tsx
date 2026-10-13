import { useEffect, useRef, useState } from 'react'
import { exportBackup, importBackup, mergeBackup, requestPersistence } from '../db'
import { AI_FIELDS, needsKey, PROVIDERS, saveSettings, usesAI, useSettings, type AIProvider } from '../settings'
import { ChevronIcon } from '../components/icons'
import { LANG_NAMES, useLang, useT } from '../i18n'
import { ScanError } from '../errors'
import { DriveSection } from '../components/DriveSection'
import { Linkify } from '../components/Linkify'
import { ArchiveSection } from '../components/ArchiveSection'
import { SectionHeader } from '../components/SectionHeader'
import type { Coffee } from '../types'

/**
 * "Add coffees from a file" was needed for a one-off import (e.g. from Notion), so it stays out of
 * sight; open the app with ?import in the address to show it again.
 */
const SHOW_MERGE = new URLSearchParams(location.search).has('import')

export function SettingsScreen({ archived, onOpen }: { archived: Coffee[]; onOpen: (id: number) => void }) {
  const t = useT()
  const lang = useLang()
  const settings = useSettings()
  // Only the chosen method shows until expanded; it opens by itself while a needed key is missing.
  const [expanded, setExpanded] = useState(() => needsKey(settings))
  // The key card belongs to the selected AI provider (Without AI has none; Gemini fields fill in).
  const ai: AIProvider = usesAI(settings.provider) ? settings.provider : 'gemini'
  const { key: keyField, model: modelField, models } = AI_FIELDS[ai]
  const keyCopy = {
    gemini: { label: t.settings.geminiKey, placeholder: 'AIza…', hint: t.settings.geminiHint },
    claude: { label: t.settings.apiKey, placeholder: 'sk-ant-…', hint: t.settings.keyHint },
    openai: { label: t.settings.openaiKey, placeholder: 'sk-…', hint: t.settings.openaiHint },
  }[ai]
  const [key, setKey] = useState(settings[keyField])
  // Show the stored key of whichever provider is selected.
  useEffect(() => setKey(settings[keyField]), [keyField, settings])
  const [persisted, setPersisted] = useState<boolean>()
  const [status, setStatus] = useState<string>()
  const [check, setCheck] = useState<{ state: 'testing' | 'ok' | 'fail'; message?: string }>()
  // A result only describes the key, provider and model it was run with.
  useEffect(() => setCheck(undefined), [key, settings.provider, settings[modelField]])

  async function testKey() {
    const trimmed = key.trim()
    setCheck({ state: 'testing' })
    try {
      const { testKey } = await import('../scan')
      await testKey(ai, trimmed, settings[modelField])
      saveSettings({ [keyField]: trimmed }) // a key that works is worth keeping
      setCheck({ state: 'ok' })
    } catch (e) {
      const message = e instanceof ScanError ? t.errors[e.code] + (e.detail ? `: ${e.detail}` : '') : `${t.errors.unknown}: ${(e as Error).message}`
      setCheck({ state: 'fail', message })
    }
  }
  const importRef = useRef<HTMLInputElement>(null)
  const mergeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(false))
  }, [])

  async function doExport() {
    const blob = await exportBackup()
    const file = new File([blob], `coffee-shelf-backup-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' })
    // On iOS the share sheet is the reliable way to save to Files or AirDrop.
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  async function doImport(file?: File) {
    if (!file) return
    if (!confirm(t.settings.confirmRestore)) return
    try {
      setStatus(t.settings.restored(await importBackup(file)))
    } catch (e) {
      const msg = (e as Error).message
      setStatus(`${t.settings.importFailed}: ${msg === 'notBackup' ? t.settings.notBackup : msg}`)
    }
  }

  async function doMerge(file?: File) {
    if (!file) return
    try {
      const { added, skipped } = await mergeBackup(file)
      setStatus(t.settings.merged(added, skipped))
    } catch (e) {
      const msg = (e as Error).message
      setStatus(`${t.settings.importFailed}: ${msg === 'notBackup' ? t.settings.notBackup : msg}`)
    }
  }

  const langs: ['en' | 'ru', string][] = [['en', LANG_NAMES.en], ['ru', LANG_NAMES.ru]]

  return (
    <div className="screen settings-screen">
      <h1 className="screen-title">{t.settings.title}</h1>

      <h2 className="section">{t.settings.language}</h2>
      <div className="segmented">
        {langs.map(([id, label]) => (
          <button key={id} className={lang === id ? 'on' : ''} onClick={() => saveSettings({ lang: id })}>
            {label}
          </button>
        ))}
      </div>

      <h2 className="section">{t.settings.labelReading}</h2>
      <div className="choices">
        {PROVIDERS.filter((p) => expanded || p === settings.provider).map((p) => {
          const chosen = settings.provider === p
          return (
            <button
              key={p}
              className={`choice${chosen ? ' on' : ''}`}
              // The chosen card opens and closes the section; the others switch method.
              onClick={() => (chosen ? setExpanded((v) => !v) : saveSettings({ provider: p }))}
              aria-pressed={chosen}
              aria-expanded={chosen ? expanded : undefined}
            >
              <span className="radio" />
              <span style={{ flex: 1 }}>
                <b>{t.settings.providers[p][0]}</b>
                <span className="sub">{t.settings.providers[p][1]}</span>
              </span>
              {chosen && (
                <span className={`chevron${expanded ? ' open' : ''}`} aria-label={expanded ? t.settings.collapse : t.settings.expand}>
                  <ChevronIcon />
                </span>
              )}
            </button>
          )
        })}
      </div>
      {!expanded ? null : usesAI(settings.provider) ? (
        <div className="card" style={{ marginTop: 12 }}>
          <label className="field">
            <span>{keyCopy.label}</span>
            <input
              className="input"
              type="password"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={keyCopy.placeholder}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onBlur={() => saveSettings({ [keyField]: key.trim() })}
            />
          </label>
          <label className="field">
            <span>{t.settings.model}</span>
            <select className="input" value={settings[modelField]} onChange={(e) => saveSettings({ [modelField]: e.target.value })}>
              {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <span className="muted small" style={{ display: 'block', margin: '6px 4px 0' }}>{t.settings.modelHints[settings[modelField]]}</span>
          </label>
          <button className="btn block" style={{ marginTop: 14 }} disabled={key.trim() === settings[keyField]} onClick={() => saveSettings({ [keyField]: key.trim() })}>
            {key.trim() === settings[keyField] && settings[keyField] ? t.settings.keySaved : t.settings.saveKey}
          </button>
          <button className="btn ghost block" style={{ marginTop: 10 }} disabled={!key.trim() || check?.state === 'testing'} onClick={testKey}>
            {check?.state === 'testing' ? t.settings.testing : t.settings.testKey}
          </button>
          {check?.state === 'ok' && <div className="small" style={{ margin: '10px 4px 0', color: 'var(--accent)', fontWeight: 600 }}>✓ {t.settings.keyWorks}</div>}
          {check?.state === 'fail' && <div className="error small" style={{ marginTop: 10 }}><Linkify text={check.message ?? ''} /></div>}
          <p className="muted small" style={{ margin: '12px 4px 0' }}><Linkify text={keyCopy.hint} /></p>
        </div>
      ) : (
        <p className="muted small" style={{ margin: '12px 4px 0' }}>{t.settings.ocrHint}</p>
      )}

      <DriveSection />

      <SectionHeader
        title={t.settings.yourData}
        info={
          <>
            <p style={{ margin: '0 0 8px' }}><b>{t.settings.persisted}.</b> {t.settings.persistedInfo}</p>
            <p style={{ margin: 0 }}>{t.settings.dataHint}</p>
          </>
        }
      />
      <div className="card stack">
        <div className="row small">
          <span>{t.settings.persisted}</span>
          <span className="spacer" />
          {persisted ? <span className="muted">{t.settings.yes}</span> : <button className="btn plain" onClick={async () => setPersisted(await requestPersistence())}>{t.settings.turnOn}</button>}
        </div>
        <button className="btn ghost block" onClick={doExport}>{t.settings.export}</button>
        {SHOW_MERGE && (
          <>
            <button className="btn ghost block" onClick={() => mergeRef.current?.click()}>{t.settings.merge}</button>
            <input ref={mergeRef} className="file-input" type="file" accept="application/json,.json" onChange={(e) => (doMerge(e.target.files?.[0]), (e.target.value = ''))} />
          </>
        )}
        <button className="btn ghost block" onClick={() => importRef.current?.click()}>{t.settings.restore}</button>
        <input ref={importRef} className="file-input" type="file" accept="application/json,.json" onChange={(e) => (doImport(e.target.files?.[0]), (e.target.value = ''))} />
        {status && <div className="muted small">{status}</div>}
      </div>

      <ArchiveSection archived={archived} onOpen={onOpen} />
    </div>
  )
}
