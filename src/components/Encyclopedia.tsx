import { useEffect, useMemo, useRef, useState } from 'react'
import type { Article, Book, Chapter } from '../encyclopedia/types'
import type { Lang } from '../types'
import { useLang, useT } from '../i18n'
import { Figure } from '../encyclopedia/figures'
import { ChevronIcon, ClearIcon, KettleIcon, TimerIcon } from './icons'
import { Sheet } from './Sheet'
import { BrewTimer } from './BrewTimer'

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

function ArticleCard({ article, chapter, snippet, onBrew }: { article: Article; chapter?: string; snippet?: string; onBrew: (a: Article) => void }) {
  const t = useT()
  return (
    <details
      className="card article"
      // Opening an article brings it to the top of the sheet, so its body reads from the start.
      onToggle={(e) => e.currentTarget.open && e.currentTarget.scrollIntoView({ block: 'start', behavior: 'smooth' })}
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
          <button type="button" className="btn block brew-start" onClick={() => onBrew(article)}>
            <TimerIcon />
            {t.brewing.start}
          </button>
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
  const top = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let live = true
    books[lang]().then((m) => live && setBook(m.default))
    return () => void (live = false)
  }, [lang])

  useEffect(() => top.current?.closest('.sheet')?.scrollTo(0, 0), [chapterId])

  const hits = useMemo(() => (book ? search(book, query) : []), [book, query])
  const chapter = book?.find((c) => c.id === chapterId)

  return (
    <Sheet
      title={t.book.title}
      onClose={chapter ? () => setChapterId(null) : onClose}
      closeLabel={`‹ ${t.book.back}`}
    >
      <div ref={top} />
      {!book ? null : chapter ? (
        <>
          <h2 className="book-chapter-title">{chapter.title}</h2>
          <p className="screen-sub">{chapter.summary}</p>
          {chapter.articles.map((a) => <ArticleCard key={a.title} article={a} onBrew={setBrewing} />)}
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
              hits.map((h) => <ArticleCard key={`${h.chapter.id}/${h.article.title}`} article={h.article} chapter={h.chapter.title} snippet={h.snippet} onBrew={setBrewing} />)
            ) : (
              <p className="muted" style={{ textAlign: 'center', margin: '32px 0' }}>{t.book.noResults}</p>
            )
          ) : (
            <>
              {book.filter((c) => c.id === BREW_CHAPTER).map((c) => (
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
              {book.filter((c) => c.id !== BREW_CHAPTER).map((c, i) => (
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
    </Sheet>
  )
}
