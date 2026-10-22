import { useEffect, useRef, useState, type ReactNode } from 'react'
import { backupFrom, backupNow, cameBackFromSignIn, restoreFromDrive, signIn, signOut, takeDriveFocus, useDrive } from '../gdrive'
import { useLang, useT } from '../i18n'
import { Avatar } from './Avatar'
import { Linkify } from './Linkify'
import { SectionHeader } from './SectionHeader'

/** Settings block for Google Drive backup; hidden until a Google client ID is configured. */
export function DriveSection() {
  const t = useT()
  const lang = useLang()
  const drive = useDrive()
  const anchor = useRef<HTMLHeadingElement>(null)
  // After sign-in or an avatar tap: bring this section into view (after the tab's own scroll reset).
  useEffect(() => {
    if (takeDriveFocus()) setTimeout(() => anchor.current?.scrollIntoView({ block: 'start' }), 50)
  }, [])
  if (!drive.enabled) return null
  const when = (ms: number) => new Date(ms).toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <SectionHeader title={t.drive.title} headingRef={anchor} info={drive.signedIn ? t.drive.auto : undefined} />
      <div className="card stack">
        {!drive.signedIn ? (
          <>
            <p className="muted small" style={{ margin: 0 }}>{t.drive.hint}</p>
            <button className="btn block" onClick={() => signIn('connect')}>{t.drive.signIn}</button>
          </>
        ) : (
          <>
            {drive.email && (
              <div className="row">
                <Avatar size="large" />
                <div style={{ fontWeight: 600, minWidth: 0, overflowWrap: 'anywhere' }}>{t.drive.signedInAs(drive.email)}</div>
              </div>
            )}
            {!drive.choose && <div className="muted small">
              {drive.busy === 'backup' ? t.drive.backingUp
                : drive.busy === 'restore' ? t.drive.restoring
                : drive.lastBackup ? t.drive.lastBackup(when(drive.lastBackup))
                : t.drive.never}
              {!drive.busy && drive.unsaved && drive.lastBackup ? ` ${t.drive.unsaved}` : ''}
            </div>}
            {drive.choose && (
              <div className="notice" style={{ marginTop: 0 }}>
                <p style={{ margin: '0 0 10px' }}>{t.drive.choose(when(drive.choose.remoteTime))}</p>
                <button className="btn block" onClick={restoreFromDrive}>{t.drive.useDrive}</button>
                <button className="btn plain block" onClick={() => confirm(t.drive.confirmReplace) && backupNow(true)}>{t.drive.usePhone}</button>
              </div>
            )}
            {drive.error && (
              <div className="error small">
                <Linkify text={t.drive.errors[drive.error]} />
                {drive.errorDetail && <div style={{ marginTop: 6, opacity: 0.75, fontSize: 12, overflowWrap: 'anywhere' }}>{t.drive.details}: {drive.errorDetail}</div>}
              </div>
            )}
            {drive.error === 'scope' && <button className="btn block" onClick={() => signIn('connect', true)}>{t.drive.signInAgain}</button>}
            {!drive.choose && (
              <>
                <button className="btn block" disabled={!!drive.busy} onClick={() => backupNow()}>{t.drive.backupNow}</button>
                <button className="btn ghost block" disabled={!!drive.busy} onClick={() => confirm(t.drive.confirmRestore) && restoreFromDrive()}>{t.drive.restore}</button>
              </>
            )}
            <button className="btn plain block" onClick={signOut}>{t.drive.signOut}</button>
          </>
        )}
      </div>
    </>
  )
}

/**
 * Shelf reminder when changes are waiting and the Google connection has lapsed. Backing up from it
 * stays on the Shelf (even through Google's sign-in page) and reports progress and the result here.
 */
export function DriveBanner() {
  const t = useT()
  const drive = useDrive()
  const [started, setStarted] = useState(() => cameBackFromSignIn() === 'shelf')
  const [done, setDone] = useState(false)
  const wasBusy = useRef(false)

  // A backup started here just finished: say so for a few seconds instead of sending you to Settings.
  useEffect(() => {
    if (drive.busy === 'backup') wasBusy.current = true
    else if (wasBusy.current) {
      wasBusy.current = false
      if (started && !drive.error) setDone(true)
    }
  }, [drive.busy, drive.error, started])
  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => (setDone(false), setStarted(false)), 3000)
    return () => clearTimeout(timer)
  }, [done])

  if (!drive.enabled) return null
  const bar = (content: ReactNode) => <div className="card compare-bar" style={{ marginTop: 0, marginBottom: 12 }}>{content}</div>
  if (started && drive.busy === 'backup') return bar(<span className="small muted">{t.drive.backingUp}</span>)
  if (done) return bar(<span className="small" style={{ color: 'var(--accent)', fontWeight: 600 }}>✓ {t.drive.synced}</span>)
  if (started && drive.error) return bar(<span className="small" style={{ color: 'var(--pass)' }}>{t.drive.errors[drive.error]}</span>)
  if (!drive.signedIn || !drive.linked || !drive.unsaved || drive.connected || drive.busy) return null
  return bar(
    <>
      <span className="small" style={{ flex: 1 }}>{t.drive.banner}</span>
      <button className="btn" onClick={() => (setStarted(true), backupFrom('shelf'))}>{t.drive.bannerAction}</button>
    </>,
  )
}
