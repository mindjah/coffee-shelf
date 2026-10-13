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
  const coffees = useLiveQuery(() => db.coffees.toArray(), [])
  const model = useMemo(() => buildModel(coffees ?? []), [coffees])
  const open = coffees?.find((c) => c.id === openId)

  useEffect(() => {
    requestPersistence()
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  if (!coffees) return null

  return (
    <>
      {/* Kept mounted so photos, an in-flight scan and an unsaved result survive tab switches. */}
      <div hidden={tab !== 'scan'}>
        <ScanScreen model={model} coffees={coffees} onSaved={(id) => (setTab('shelf'), setOpenId(id))} onOpenSettings={() => setTab('settings')} />
      </div>
      {tab === 'shelf' && <LibraryScreen coffees={coffees} onOpen={setOpenId} />}
      {tab === 'taste' && <InsightsScreen coffees={coffees} model={model} />}
      {tab === 'settings' && <SettingsScreen />}

      {open && <CoffeeDetail key={open.id} coffee={open} model={model} onClose={() => setOpenId(undefined)} />}

      <PhotoViewer />

      <nav className="tabbar">
        {TABS.map(({ id, icon: Icon }) => (
          <button key={id} className={`tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}>
            <Icon />
            {t.tabs[id]}
          </button>
        ))}
      </nav>
    </>
  )
}
