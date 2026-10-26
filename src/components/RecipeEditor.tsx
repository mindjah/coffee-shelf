import { useState } from 'react'
import { db, type Recipe } from '../db'
import { useT } from '../i18n'
import { ChevronIcon, ClearIcon, PlusIcon } from './icons'
import { Sheet } from './Sheet'

interface StepDraft {
  key: number
  text: string
  /** As typed: "0:45", "45" or empty for a step at your own pace. */
  time: string
}

/** "1:30" → 90, "45" → 45, anything else (or 0) → null. */
export function parseTime(s: string): number | null {
  const m = s.trim().match(/^(?:(\d+)[:.,])?(\d+)$/)
  if (!m) return null
  const secs = Number(m[1] ?? 0) * 60 + Number(m[2])
  return secs > 0 ? secs : null
}

export const formatTime = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

const num = (s: string) => {
  const n = Number(s.replace(',', '.'))
  return s.trim() && Number.isFinite(n) && n > 0 ? n : null
}

let nextKey = 1
const blankStep = (): StepDraft => ({ key: nextKey++, text: '', time: '' })

/** Writing a brew recipe of your own: amounts, then steps, each with how long it lasts. */
export function RecipeEditor({ recipe, onClose }: { recipe?: Recipe; onClose: () => void }) {
  const t = useT()
  const [name, setName] = useState(recipe?.name ?? '')
  const [note, setNote] = useState(recipe?.note ?? '')
  const [coffee, setCoffee] = useState(recipe?.coffee?.toString() ?? '')
  const [water, setWater] = useState(recipe?.water?.toString() ?? '')
  const [temp, setTemp] = useState(recipe?.temp?.toString() ?? '')
  const [grind, setGrind] = useState(recipe?.grind ?? '')
  const [steps, setSteps] = useState<StepDraft[]>(() =>
    recipe?.steps.length ? recipe.steps.map((s) => ({ key: nextKey++, text: s.text, time: s.seconds ? formatTime(s.seconds) : '' })) : [blankStep()],
  )

  const filled = steps.filter((s) => s.text.trim())
  const canSave = !!name.trim() && filled.length > 0

  const setStep = (key: number, patch: Partial<StepDraft>) => setSteps((all) => all.map((s) => (s.key === key ? { ...s, ...patch } : s)))
  const moveUp = (i: number) => setSteps((all) => (i ? [...all.slice(0, i - 1), all[i], all[i - 1], ...all.slice(i + 1)] : all))

  const save = async () => {
    if (!canSave) return
    const next: Recipe = {
      createdAt: recipe?.createdAt ?? Date.now(),
      name: name.trim(),
      note: note.trim(),
      coffee: num(coffee),
      water: num(water),
      temp: num(temp),
      grind: grind.trim(),
      steps: filled.map((s) => ({ text: s.text.trim(), seconds: parseTime(s.time) })),
    }
    await db.recipes.put(recipe?.id != null ? { ...next, id: recipe.id } : next)
    onClose()
  }

  const remove = async () => {
    if (recipe?.id == null || !confirm(t.recipe.confirmDelete(recipe.name))) return
    await db.recipes.delete(recipe.id)
    onClose()
  }

  return (
    <Sheet
      title={recipe ? t.recipe.editTitle : t.recipe.newTitle}
      closeLabel={t.common.cancel}
      onClose={onClose}
      action={{ label: t.recipe.save, onClick: save, disabled: !canSave }}
    >
      <div className="card">
        <label className="field">
          <span>{t.recipe.name}</span>
          <input className="input" value={name} placeholder={t.recipe.namePlaceholder} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>{t.recipe.note}</span>
          <input className="input" value={note} placeholder={t.recipe.notePlaceholder} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <label className="field">
            <span>{t.recipe.coffee}</span>
            <input className="input" inputMode="decimal" placeholder="15" value={coffee} onChange={(e) => setCoffee(e.target.value.replace(/[^\d.,]/g, ''))} />
          </label>
          <label className="field">
            <span>{t.recipe.water}</span>
            <input className="input" inputMode="decimal" placeholder="250" value={water} onChange={(e) => setWater(e.target.value.replace(/[^\d.,]/g, ''))} />
          </label>
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <label className="field">
            <span>{t.recipe.temp}</span>
            <input className="input" inputMode="numeric" placeholder="94" value={temp} onChange={(e) => setTemp(e.target.value.replace(/\D/g, ''))} />
          </label>
          <label className="field">
            <span>{t.recipe.grind}</span>
            <input className="input" placeholder={t.recipe.grindPlaceholder} value={grind} onChange={(e) => setGrind(e.target.value)} />
          </label>
        </div>
      </div>

      <h2 className="section">{t.recipe.steps}</h2>
      {steps.map((s, i) => (
        <div className="card recipe-step" key={s.key}>
          <div className="row">
            <span className="brew-step-num">{i + 1}</span>
            <span className="spacer" />
            {i > 0 && (
              <button type="button" className="recipe-step-btn up" onClick={() => moveUp(i)} aria-label={t.recipe.moveUp}>
                <ChevronIcon />
              </button>
            )}
            {steps.length > 1 && (
              <button type="button" className="recipe-step-btn" onClick={() => setSteps((all) => all.filter((x) => x.key !== s.key))} aria-label={t.recipe.removeStep}>
                <ClearIcon />
              </button>
            )}
          </div>
          <textarea className="input" rows={2} value={s.text} placeholder={t.recipe.stepPlaceholder} onChange={(e) => setStep(s.key, { text: e.target.value })} />
          <label className="recipe-step-time">
            <span>{t.recipe.time}</span>
            <input
              className="input"
              inputMode="decimal"
              placeholder="—"
              value={s.time}
              onChange={(e) => setStep(s.key, { time: e.target.value.replace(/[^\d:.,]/g, '') })}
              onBlur={() => setStep(s.key, { time: parseTime(s.time) ? formatTime(parseTime(s.time)!) : '' })}
            />
          </label>
        </div>
      ))}
      <button type="button" className="btn ghost block" style={{ marginTop: 12 }} onClick={() => setSteps((all) => [...all, blankStep()])}>
        <PlusIcon /> {t.recipe.addStep}
      </button>
      <p className="muted small" style={{ margin: '10px 4px 0' }}>{t.recipe.stepsHint}</p>

      {recipe && (
        <button type="button" className="btn danger block" style={{ marginTop: 20 }} onClick={remove}>{t.recipe.delete}</button>
      )}
    </Sheet>
  )
}
