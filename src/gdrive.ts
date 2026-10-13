// Automatic backup to Google Drive, without a server.
//
// Sign-in is Google's OAuth flow for browser apps (response_type=token) done as a full-page
// redirect rather than a popup, because popups are unreliable in iOS Home Screen apps. The app
// asks only for drive.appdata: a hidden per-app folder, so it can't see the user's other files.
// Browser tokens last about an hour and can't be refreshed silently, so backups run on their own
// while connected and otherwise wait for one tap ("Back up now").
import { useSyncExternalStore } from 'react'
import { GOOGLE_CLIENT_ID } from './config'
import { exportBackup, importBackup, lastChange, onShelfChange } from './db'

// "profile" only adds the name and picture shown as the avatar.
const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'coffee-shelf-backup.json'
const KEY = 'coffee-shelf.drive'
const AUTO_BACKUP_DELAY_MS = 4000

type Intent = 'connect' | 'backup' | 'restore'

interface Stored {
  email?: string
  name?: string
  /** Google profile picture URL (needs the "profile" permission). */
  picture?: string
  token?: string
  /** ms timestamp */
  expiresAt?: number
  /** Last successful upload from this device. */
  lastBackup?: number
  /** Modified time of the Drive file when last seen. */
  remoteTime?: number
  /**
   * This device has backed up or restored at least once. Until then automatic backup stays off,
   * so a fresh phone can't overwrite an existing Drive backup with an empty shelf.
   */
  linked?: boolean
  /** Sign-in round trip in progress. */
  pending?: { state: string; intent: Intent }
}

export type DriveError = 'signin' | 'expired' | 'network' | 'quota' | 'apiDisabled' | 'scope' | 'failed'

export interface DriveState extends Stored {
  enabled: boolean
  signedIn: boolean
  /** A usable access token right now. */
  connected: boolean
  busy: 'backup' | 'restore' | null
  error?: DriveError
  /** Google's own reason, e.g. "403 SERVICE_DISABLED", shown small under the message. */
  errorDetail?: string
  /** Drive has a backup but this device hasn't chosen between restoring and replacing it. */
  choose?: { remoteTime: number }
  /** Shelf changed since the last backup from this device. */
  unsaved: boolean
}

let stored: Stored = load()
let busy: DriveState['busy'] = null
let error: DriveError | undefined
let errorDetail: string | undefined
let choose: DriveState['choose']
let snapshot = build()
const listeners = new Set<() => void>()

function load(): Stored {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function build(): DriveState {
  const connected = !!stored.token && (stored.expiresAt ?? 0) > Date.now() + 60_000
  return {
    ...stored,
    enabled: !!GOOGLE_CLIENT_ID,
    signedIn: !!stored.email,
    connected,
    busy,
    error,
    errorDetail,
    choose,
    unsaved: !!stored.email && lastChange() > (stored.lastBackup ?? 0),
  }
}

function update(patch: Partial<Stored> = {}) {
  stored = { ...stored, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(stored))
  } catch {
    // Kept for this session only.
  }
  snapshot = build()
  listeners.forEach((l) => l())
}

export function useDrive(): DriveState {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => snapshot,
  )
}

// --- sign-in -------------------------------------------------------------------

const redirectUri = () => new URL(import.meta.env.BASE_URL, location.origin).href

/** Leaves the app for Google's sign-in page; handleRedirect() finishes on return. */
/** `forceConsent` shows Google's permission screen again, e.g. after the Drive box was left unticked. */
export function signIn(intent: Intent = 'connect', forceConsent = false) {
  const state = crypto.randomUUID()
  update({ pending: { state, intent } })
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'token',
    scope: SCOPES,
    state,
    include_granted_scopes: 'true',
    // A known account comes straight back without the account picker.
    ...(forceConsent ? { prompt: 'consent', ...(stored.email ? { login_hint: stored.email } : {}) }
      : stored.email ? { login_hint: stored.email } : { prompt: 'select_account' }),
  })
  location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}

export function signOut() {
  const token = stored.token
  stored = {}
  error = undefined
  errorDetail = undefined
  choose = undefined
  update()
  if (token) fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, { method: 'POST' }).catch(() => {})
}

let cameBack = false

/** True when this launch is the return from Google's sign-in page (the app opens on Settings). */
export const cameBackFromSignIn = () => cameBack

/** Call once at startup: picks up the token Google puts in the URL fragment after sign-in. */
export async function handleRedirect() {
  if (!location.hash.includes('access_token=') && !location.hash.includes('error=')) return
  cameBack = true
  const params = new URLSearchParams(location.hash.slice(1))
  history.replaceState(null, '', location.pathname + location.search)
  const pending = stored.pending
  if (!pending || params.get('state') !== pending.state) return update({ pending: undefined })
  if (params.get('error') || !params.get('access_token')) {
    error = 'signin'
    return update({ pending: undefined })
  }
  const token = params.get('access_token')!
  update({ token, expiresAt: Date.now() + Number(params.get('expires_in') ?? 3600) * 1000, pending: undefined })
  try {
    const me = await api('https://www.googleapis.com/oauth2/v3/userinfo')
    const { email, name, picture } = await me.json()
    update({ email, name, picture })
  } catch {
    // The email is only for display; carry on without it.
  }
  // Google's permission screen has a checkbox per permission; without Drive there's nothing to do.
  const granted = params.get('scope') ?? ''
  if (granted && !granted.includes('drive.appdata')) {
    error = 'scope'
    errorDetail = `scope: ${granted}`
    return update()
  }
  if (pending.intent === 'restore') await restoreFromDrive()
  else await afterConnect()
}

// --- Drive ---------------------------------------------------------------------

class DriveHttpError extends Error {
  constructor(public status: number, public body = '') {
    super(`Drive ${status}`)
  }
}

async function api(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${stored.token}` } })
  if (!res.ok) throw new DriveHttpError(res.status, await res.text().catch(() => ''))
  return res
}

async function findFile(): Promise<{ id: string; modifiedTime: string } | undefined> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`)
  const res = await api(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`)
  return (await res.json()).files?.[0]
}

/** Resumable upload, so a shelf with many photos isn't limited by the 5 MB simple-upload cap. */
async function upload(body: string, fileId?: string): Promise<{ modifiedTime: string }> {
  const meta = fileId ? {} : { name: FILE_NAME, parents: ['appDataFolder'] }
  const start = await api(
    `https://www.googleapis.com/upload/drive/v3/files${fileId ? `/${fileId}` : ''}?uploadType=resumable&fields=modifiedTime`,
    { method: fileId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'application/json' }, body: JSON.stringify(meta) },
  )
  const session = start.headers.get('Location')
  if (!session) throw new DriveHttpError(500)
  const res = await fetch(session, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
  if (!res.ok) throw new DriveHttpError(res.status, await res.text().catch(() => ''))
  return res.json()
}

/** Google's machine-readable reason from an error body, e.g. "SERVICE_DISABLED". */
function reasonOf(body: string): string {
  try {
    const err = JSON.parse(body).error ?? {}
    const detail = (err.details ?? []).find((d: { reason?: string }) => d.reason)?.reason
    return detail ?? err.errors?.[0]?.reason ?? err.status ?? ''
  } catch {
    return body.slice(0, 80)
  }
}

function fail(e: unknown) {
  if (e instanceof DriveHttpError) {
    const reason = reasonOf(e.body)
    errorDetail = `${e.status} ${reason}`.trim()
    if (e.status === 401) {
      error = 'expired'
      return update({ token: undefined, expiresAt: undefined })
    }
    error = /SERVICE_DISABLED|accessNotConfigured/.test(reason) ? 'apiDisabled'
      : /SCOPE_INSUFFICIENT|insufficientPermissions|insufficientScopes/.test(reason) ? 'scope'
      : /storageQuotaExceeded|quotaExceeded/.test(reason) ? 'quota'
      : 'failed'
  } else {
    error = 'network'
    errorDetail = (e as Error)?.message
  }
  update()
}

async function run<T>(kind: 'backup' | 'restore', work: () => Promise<T>): Promise<T | undefined> {
  if (busy) return
  busy = kind
  error = undefined
  errorDetail = undefined
  update()
  try {
    return await work()
  } catch (e) {
    fail(e)
  } finally {
    busy = null
    update()
  }
}

/** First connection on this device: never let an empty phone silently replace a Drive backup. */
async function afterConnect(): Promise<void> {
  if (stored.linked) return backupNow()
  const file = await run('backup', findFile)
  if (file) {
    choose = { remoteTime: Date.parse(file.modifiedTime) }
    return update({ remoteTime: choose.remoteTime })
  }
  if (!error) await backupNow(true)
}

/** Uploads the whole shelf. `force` also replaces a Drive backup this device hasn't linked to yet. */
export async function backupNow(force = false): Promise<void> {
  if (!snapshot.connected) return signIn('backup')
  if (!stored.linked && !force) return afterConnect()
  await run('backup', async () => {
    const startedAt = Date.now()
    const file = await findFile()
    const { modifiedTime } = await upload(await (await exportBackup()).text(), file?.id)
    choose = undefined
    update({ lastBackup: startedAt, remoteTime: Date.parse(modifiedTime), linked: true })
  })
}

export async function restoreFromDrive() {
  if (!snapshot.connected) return signIn('restore')
  await run('restore', async () => {
    const file = await findFile()
    if (!file) throw new DriveHttpError(404)
    const res = await api(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`)
    await importBackup(await res.blob())
    choose = undefined
    // The shelf now equals the Drive copy, so nothing is waiting to be backed up.
    update({ lastBackup: Date.now(), remoteTime: Date.parse(file.modifiedTime), linked: true })
  })
}

// --- automatic backup ------------------------------------------------------------

let timer: ReturnType<typeof setTimeout> | undefined

/** Backs up a few seconds after the shelf changes, whenever a token is still valid. */
export function startAutoBackup() {
  const schedule = () => {
    update() // refresh "unsaved"
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (snapshot.connected && stored.linked && snapshot.unsaved) backupNow()
    }, AUTO_BACKUP_DELAY_MS)
  }
  onShelfChange(schedule)
  // Expiry isn't an event; re-check now and then so "connected" stays truthful.
  setInterval(() => update(), 60_000)
  schedule()
}
