import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, requestPersistence } from './db'
import { buildModel } from './recommend'
import { ScanScreen } from './screens/ScanScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { CoffeeDetail } from './screens/CoffeeDetail'
import { CameraIcon, GearIcon, ShelfIcon, TasteIcon } from './components/icons'
import { useLang, useT } from './i18n'
import { cameBackFromSignIn } from './gdrive'
import { PhotoViewer } from './components/PhotoViewer'

type Tab = 'scan' | 'shelf' | 'taste' | 'settings'

const TABS: { id: Tab; icon: () => React.JSX.Element }[] = [
  { id: 'scan', icon: CameraIcon },
  { id: 'shelf', icon: ShelfIcon },
  { id: 'taste', icon: TasteIcon },
  { id: 'settings', icon: GearIcon },
]

export default function App() {
  const t = useT()
  const lang = useLang()
  // Back from Google sign-in → show the Google Drive status in Settings.
  const [tab, setTab] = useState<Tab>(() => (cameBackFromSignIn() ? 'settings' : 'scan'))
  const [openId, setOpenId] = useState<number>()
  const all = useLiveQuery(() => db.coffees.toArray(), [])
  // Archived coffees stay in the database but leave the shelf, the taste profile and predictions.
  const coffees = useMemo(() => all?.filter((c) => !c.archivedAt), [all])
  const archived = useMemo(() => (all ?? []).filter((c) => c.archivedAt).sort((a, b) => b.archivedAt! - a.archivedAt!), [all])
  const model = useMemo(() => buildModel(coffees ?? []), [coffees])
  const open = all?.find((c) => c.id === openId)

  useEffect(() => {
    requestPersistence()
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  if (!coffees || !all) return null

  return (
    <>
      {/* Kept mounted so photos, an in-flight scan and an unsaved result survive tab switches. */}
      <div hidden={tab !== 'scan'}>
        <ScanScreen model={model} coffees={all} onSaved={(id) => (setTab('shelf'), setOpenId(id))} onOpenSettings={() => setTab('settings')} />
      </div>
      {tab === 'shelf' && <LibraryScreen coffees={coffees} model={model} onOpen={setOpenId} />}
      {tab === 'taste' && <InsightsScreen coffees={coffees} model={model} />}
      {tab === 'settings' && <SettingsScreen archived={archived} onOpen={setOpenId} />}

      {open && <CoffeeDetail key={open.id} coffee={open} model={model} onClose={() => setOpenId(undefined)} />}

      <PhotoViewer />

      {/* Tapping the tab you're already on scrolls it back to the top, as in iOS apps. */}
      <nav className="tabbar">
        {TABS.map(({ id, icon: Icon }) => (
          <button key={id} className={`tab${tab === id ? ' active' : ''}`} onClick={() => (id === tab ? window.scrollTo({ top: 0, behavior: 'smooth' }) : setTab(id))} aria-current={tab === id ? 'page' : undefined}>
            <Icon />
            {t.tabs[id]}
          </button>
        ))}
      </nav>
    </>
  )
}
