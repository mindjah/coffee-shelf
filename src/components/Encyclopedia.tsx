import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Article, Book, Chapter } from '../encyclopedia/types'
import type { Lang } from '../types'
import { useLang, useT, type Dict } from '../i18n'
import { db, type Recipe } from '../db'
import { Figure } from '../encyclopedia/figures'
import { ChevronIcon, ClearIcon, KettleIcon, PencilIcon, PlusIcon, TimerIcon } from './icons'
import { Sheet } from './Sheet'
import { BrewTimer } from './BrewTimer'
import { RecipeEditor, formatTime } from './RecipeEditor'

// Each language is its own chunk, fetched the first time the book opens.
const books: Record<Lang, () => Promise<{ default: Book }>> = {
  en: () => import('../encyclopedia/en'),
  ru: () => import('../encyclopedia/ru'),
  es: () => import('../encyclopedia/es'),
}

/** Lower case, no accents, ё as е — so "cafe" finds "café". */
const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ё/g, 'е')

/** Everything below the headline, one string per line, as the search sees it. */
function bodyLines(a: Article): string[] {
  return [
    ...(a.parts ?? []).map(([k, v]) => `${k} — ${v}`),
    ...(a.facts ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(a.text ?? []),
    ...(a.steps ?? []),
    ...(a.terms ?? []).map(([k, v]) => `${k} — ${v}`),
    ...(a.tip ? [a.tip] : []),
  ]
}

interface Hit {
  chapter: Chapter
  article: Article
  /** The body line that matched, when the title and lead don't show why it's here. */
  snippet?: string
  /** 0 a glossary term, 1 the headline, 2 only the body matched. */
  rank: number
}

function search(book: Book, query: string): Hit[] {
  // Drop endings so "панама" also finds "в Панаме" and "roasting" finds "roast".
  const words = fold(query).split(/\s+/).filter(Boolean).map((w) => (w.length >= 5 ? w.slice(0, Math.max(4, w.length - 2)) : w))
  if (!words.length) return []
  const hits: Hit[] = []
  for (const chapter of book) {
    for (const article of chapter.articles) {
      const head = fold(`${chapter.title} ${article.title} ${article.lead}`)
      const lines = bodyLines(article)
      const all = `${head} ${fold(lines.join(' '))}`
      if (!words.every((w) => all.includes(w))) continue
      const missing = words.filter((w) => !head.includes(w))
      // A matching glossary term is the answer itself, so show it even when the headline matched.
      const term = article.terms?.find(([k]) => words.some((w) => fold(k).includes(w)))
      const snippet = term ? `${term[0]} — ${term[1]}` : missing.length ? lines.find((l) => missing.some((w) => fold(l).includes(w))) : undefined
      hits.push({ chapter, article, snippet, rank: term ? 0 : missing.length ? 2 : 1 })
    }
  }
  return hits.sort((a, b) => a.rank - b.rank)
}

/** The chapter with brewable recipes, shown apart at the top of the contents. */
const BREW_CHAPTER = 'methods'

/** Your own recipe as an encyclopedia article, so it reads, searches and brews like the others. */
function recipeArticle(r: Recipe, t: Dict): Article {
  const facts: [string, string][] = []
  if (r.coffee) facts.push([t.recipe.factCoffee, t.coffee.grams(r.coffee)])
  if (r.water) facts.push([t.recipe.factWater, [t.coffee.grams(r.water), r.temp && `${r.temp} °C`].filter(Boolean).join(', ')])
  else if (r.temp) facts.push([t.recipe.factWater, `${r.temp} °C`])
  if (r.coffee && r.water) facts.push([t.recipe.factRatio, `1:${Math.round((r.water / r.coffee) * 10) / 10}`])
  if (r.grind) facts.push([t.recipe.factGrind, r.grind])
  const timed = r.steps.reduce((sum, s) => sum + (s.seconds ?? 0), 0)
  if (timed) facts.push([t.recipe.factTime, `~${formatTime(timed)}`])
  return {
    title: r.name,
    lead: r.note,
    facts: facts.length ? facts : undefined,
    steps: r.steps.map((s) => s.text),
    timer: r.steps.map((s) => s.seconds),
    recipeId: r.id,
  }
}

interface CardProps {
  article: Article
  chapter?: string
  snippet?: string
  onBrew: (a: Article) => void
  onEdit: (recipeId: number) => void
}

function ArticleCard({ article, chapter, snippet, onBrew, onEdit }: CardProps) {
  const t = useT()
  return (
    <details
      className="card article"
      onToggle={(e) => {
        const el = e.currentTarget
        if (!el.open) return
        // One article open at a time: close the rest first, then bring this one to the top of the sheet.
        el.closest('.sheet')?.querySelectorAll<HTMLDetailsElement>('details.article[open]').forEach((d) => d !== el && (d.open = false))
        el.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }}
    >
      <summary>
        {chapter && <span className="article-chapter">{chapter}</span>}
        <span className="article-title">{article.title}</span>
        <span className="article-lead">{article.lead}</span>
        {snippet && <span className="article-snippet">{snippet}</span>}
      </summary>
      <div className="article-body">
        {article.figure && <Figure id={article.figure} />}
        {article.parts && (
          <ol className="article-parts">
            {article.parts.map(([k, v], i) => (
              <li key={k}><span className="article-part-num">{i + 1}</span><span><b>{k}</b> — {v}</span></li>
            ))}
          </ol>
        )}
        {article.facts && (
          <dl className="article-facts">
            {article.facts.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        )}
        {article.text?.map((p, i) => <p key={i}>{p}</p>)}
        {article.steps && <ol className="article-steps">{article.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
        {article.timer && (
          <div className="brew-actions">
            <button type="button" className="btn brew-start" onClick={() => onBrew(article)}>
              <TimerIcon />
              {t.brewing.start}
            </button>
            {article.recipeId != null && (
              <button type="button" className="btn ghost brew-edit" onClick={() => onEdit(article.recipeId!)} aria-label={t.common.edit}>
                <PencilIcon />
              </button>
            )}
          </div>
        )}
        {article.terms && (
          <dl className="article-terms">
            {article.terms.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        )}
        {article.tip && <p className="article-tip">{article.tip}</p>}
      </div>
    </details>
  )
}

export function Encyclopedia({ onClose }: { onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const [book, setBook] = useState<Book | null>(null)
  const [chapterId, setChapterId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [brewing, setBrewing] = useState<Article | null>(null)
  /** The recipe being written: 'new', or the id of one being edited. */
  const [editing, setEditing] = useState<'new' | number | null>(null)
  const recipes = useLiveQuery(() => db.recipes.orderBy('createdAt').toArray(), [])
  const top = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let live = true
    books[lang]().then((m) => live && setBook(m.default))
    return () => void (live = false)
  }, [lang])

  useEffect(() => {
    top.current?.closest('.sheet')?.scrollTo(0, 0)
  }, [chapterId])

  // Your own recipes lead the brew methods chapter.
  const full = useMemo(
    () => book?.map((c) => (c.id === BREW_CHAPTER && recipes?.length ? { ...c, articles: [...recipes.map((r) => recipeArticle(r, t)), ...c.articles] } : c)) ?? null,
    [book, recipes, t],
  )
  const hits = useMemo(() => (full ? search(full, query) : []), [full, query])
  const chapter = full?.find((c) => c.id === chapterId)
  const mine = chapter?.id === BREW_CHAPTER ? recipes?.length ?? 0 : 0
  const cardProps = { onBrew: setBrewing, onEdit: setEditing }

  return (
    <Sheet
      title={t.book.title}
      onClose={chapter ? () => setChapterId(null) : onClose}
      closeLabel={`‹ ${t.book.back}`}
    >
      <div ref={top} />
      {!full ? null : chapter ? (
        <>
          <div className="row book-chapter-head">
            <h2 className="book-chapter-title">{chapter.title}</h2>
            {chapter.id === BREW_CHAPTER && (
              <button type="button" className="icon-btn chapter-add" onClick={() => setEditing('new')} aria-label={t.recipe.add}>
                <PlusIcon />
              </button>
            )}
          </div>
          <p className="screen-sub">{chapter.summary}</p>
          {chapter.articles.map((a, i) => (
            <Fragment key={a.recipeId != null ? `r${a.recipeId}` : a.title}>
              {mine > 0 && i === 0 && <h2 className="section">{t.recipe.mine}</h2>}
              {mine > 0 && i === mine && <h2 className="section">{chapter.title}</h2>}
              <ArticleCard article={a} {...cardProps} />
            </Fragment>
          ))}
        </>
      ) : (
        <>
          <div className="book-search">
            <input
              className="input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.book.search}
              aria-label={t.book.search}
            />
            {query && (
              <button type="button" className="book-search-clear" onClick={() => setQuery('')} aria-label={t.common.cancel}>
                <ClearIcon />
              </button>
            )}
          </div>
          {query.trim() ? (
            hits.length ? (
              hits.map((h) => <ArticleCard key={`${h.chapter.id}/${h.article.title}`} article={h.article} chapter={h.chapter.title} snippet={h.snippet} {...cardProps} />)
            ) : (
              <p className="muted" style={{ textAlign: 'center', margin: '32px 0' }}>{t.book.noResults}</p>
            )
          ) : (
            <>
              {full.filter((c) => c.id === BREW_CHAPTER).map((c) => (
                <button type="button" key={c.id} className="card book-brew" onClick={() => setChapterId(c.id)}>
                  <KettleIcon />
                  <span className="book-toc-text">
                    <b>{c.title}</b>
                    <span>{t.book.brewHint}</span>
                  </span>
                  <ChevronIcon />
                </button>
              ))}
            <div className="card book-toc">
              {full.filter((c) => c.id !== BREW_CHAPTER).map((c, i) => (
                <button type="button" key={c.id} className="book-toc-row" onClick={() => setChapterId(c.id)}>
                  <span className="book-toc-num">{i + 1}</span>
                  <span className="book-toc-text">
                    <b>{c.title}</b>
                    <span>{c.summary}</span>
                  </span>
                  <ChevronIcon />
                </button>
              ))}
            </div>
            </>
          )}
        </>
      )}
      {brewing && <BrewTimer article={brewing} onClose={() => setBrewing(null)} />}
      {editing != null && (
        <RecipeEditor recipe={editing === 'new' ? undefined : recipes?.find((r) => r.id === editing)} onClose={() => setEditing(null)} />
      )}
    </Sheet>
  )
}
