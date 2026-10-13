import { useEffect, useRef, useState } from 'react'
import { exportBackup, importBackup, requestPersistence } from '../db'
import { GEMINI_MODELS, MODELS, saveSettings, useSettings, type Provider, type Settings } from '../settings'
import { LANG_NAMES, useT } from '../i18n'

export function SettingsScreen() {
  const t = useT()
  const settings = useSettings()
  const isClaude = settings.provider === 'claude'
  const keyField = isClaude ? 'apiKey' : 'geminiKey'
  const modelField = isClaude ? 'model' : 'geminiModel'
  const models = isClaude ? MODELS : GEMINI_MODELS
  const [key, setKey] = useState(settings[keyField])
  // Show the stored key of whichever provider is selected.
  useEffect(() => setKey(settings[keyField]), [keyField, settings])
  const [persisted, setPersisted] = useState<boolean>()
  const [status, setStatus] = useState<string>()
  const importRef = useRef<HTMLInputElement>(null)

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

  const langs: [Settings['lang'], string][] = [['auto', t.settings.langAuto], ['en', LANG_NAMES.en], ['ru', LANG_NAMES.ru]]

  return (
    <div className="screen">
      <h1 className="screen-title">{t.settings.title}</h1>
      <p className="screen-sub">{t.settings.subtitle}</p>

      <h2 className="section">{t.settings.language}</h2>
      <div className="segmented">
        {langs.map(([id, label]) => (
          <button key={id} className={settings.lang === id ? 'on' : ''} onClick={() => saveSettings({ lang: id })}>
            {label}
          </button>
        ))}
      </div>

      <h2 className="section">{t.settings.labelReading}</h2>
      <div className="segmented">
        {(['gemini', 'claude'] as Provider[]).map((p) => (
          <button key={p} className={settings.provider === p ? 'on' : ''} onClick={() => saveSettings({ provider: p })}>
            {p === 'gemini' ? t.settings.providerFree : t.settings.providerPaid}
          </button>
        ))}
      </div>
      <div className="card">
        <label className="field">
          <span>{isClaude ? t.settings.apiKey : t.settings.geminiKey}</span>
          <input
            className="input"
            type="password"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={isClaude ? 'sk-ant-…' : 'AIza…'}
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
        <p className="muted small" style={{ margin: '12px 4px 0' }}>{isClaude ? t.settings.keyHint : t.settings.geminiHint}</p>
      </div>

      <h2 className="section">{t.settings.yourData}</h2>
      <div className="card stack">
        <div className="row small">
          <span>{t.settings.persisted}</span>
          <span className="spacer" />
          {persisted ? <span className="muted">{t.settings.yes}</span> : <button className="btn plain" onClick={async () => setPersisted(await requestPersistence())}>{t.settings.turnOn}</button>}
        </div>
        <button className="btn ghost block" onClick={doExport}>{t.settings.export}</button>
        <button className="btn ghost block" onClick={() => importRef.current?.click()}>{t.settings.restore}</button>
        <input ref={importRef} className="file-input" type="file" accept="application/json,.json" onChange={(e) => (doImport(e.target.files?.[0]), (e.target.value = ''))} />
        {status && <div className="muted small">{status}</div>}
      </div>
      <p className="muted small" style={{ margin: '12px 4px 0' }}>{t.settings.dataHint}</p>
    </div>
  )
}
