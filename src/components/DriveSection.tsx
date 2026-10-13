import { useEffect, useRef } from 'react'
import { backupNow, restoreFromDrive, signIn, signOut, takeDriveFocus, useDrive } from '../gdrive'
import { useLang, useT } from '../i18n'
import { Avatar } from './Avatar'
import { Linkify } from './Linkify'
import { CardInfo } from './CardInfo'

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
      <h2 className="section" ref={anchor} style={{ scrollMarginTop: 'calc(var(--safe-top) + 12px)' }}>{t.drive.title}</h2>
      <div className={`card stack${drive.signedIn ? ' has-info' : ''}`}>
        {!drive.signedIn ? (
          <>
            <p className="muted small" style={{ margin: 0 }}>{t.drive.hint}</p>
            <button className="btn block" onClick={() => signIn('connect')}>{t.drive.signIn}</button>
          </>
        ) : (
          <>
            <CardInfo>{t.drive.auto}</CardInfo>
            {drive.email && (
              <div className="row info-clear">
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

/** Shelf reminder when changes are waiting and the Google connection has lapsed. */
export function DriveBanner() {
  const t = useT()
  const drive = useDrive()
  if (!drive.enabled || !drive.signedIn || !drive.linked || !drive.unsaved || drive.connected || drive.busy) return null
  return (
    <div className="card compare-bar" style={{ marginTop: 0, marginBottom: 12 }}>
      <span className="small" style={{ flex: 1 }}>{t.drive.banner}</span>
      <button className="btn" onClick={() => backupNow()}>{t.drive.bannerAction}</button>
    </div>
  )
}
