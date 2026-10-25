import type { ReactNode } from 'react'

// Schematic cross-sections for the equipment chapter. No words inside: numbered callouts
// match the numbered parts listed under each picture, so one drawing serves every language.

const ink = 'var(--text)'
const glass = 'color-mix(in srgb, var(--accent-soft) 55%, transparent)'
const body = 'var(--surface-2)'
const grounds = 'var(--accent)'
const brew = 'var(--like)'
const water = 'color-mix(in srgb, #7fb2d9 60%, transparent)'
const paper = 'var(--maybe)'
const metal = 'color-mix(in srgb, var(--muted) 35%, var(--surface))'
const wood = '#b07a4a'

const line = { fill: 'none', stroke: ink, strokeWidth: 1.6, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

/** A numbered dot with a leader to the part it names. */
function Callout({ n, x, y, tx, ty }: { n: number; x: number; y: number; tx: number; ty: number }) {
  return (
    <g>
      <path d={`M${x} ${y}L${tx} ${ty}`} stroke="var(--maybe)" strokeWidth="0.9" />
      <circle cx={x} cy={y} r="1.8" fill="var(--accent)" />
      <circle cx={tx} cy={ty} r="7" fill="var(--accent)" />
      <text x={tx} y={ty + 3.2} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--on-accent)" fontFamily="-apple-system, system-ui, sans-serif">{n}</text>
    </g>
  )
}

const Svg = ({ children, h = 160 }: { children: ReactNode; h?: number }) => (
  <svg viewBox={`0 0 200 ${h}`} className="article-figure" role="img" aria-hidden="true">{children}</svg>
)

/** Glass server under drippers. */
const Server = () => (
  <>
    <path d="M62 104h76v30a12 12 0 0 1-12 12H74a12 12 0 0 1-12-12z" fill={glass} />
    <path d="M64 124h72v10a10 10 0 0 1-10 10H74a10 10 0 0 1-10-10z" fill={brew} opacity="0.85" />
    <path d="M62 104h76v30a12 12 0 0 1-12 12H74a12 12 0 0 1-12-12z" {...line} />
    <path d="M138 110c10 0 12 6 12 12s-2 12-12 12" {...line} />
  </>
)

const Drops = ({ x = 100, y = 104 }) => (
  <g fill={brew}>
    <ellipse cx={x} cy={y} rx="1.6" ry="2.4" />
    <ellipse cx={x} cy={y + 9} rx="1.6" ry="2.4" />
  </g>
)

function V60() {
  return (
    <Svg>
      <defs>
        <clipPath id="fig-v60-cone"><path d="M50 30h100l-38 63H88z" /></clipPath>
      </defs>
      <Server />
      <path d="M50 30h100l-38 63H88z" fill={body} />
      <g clipPath="url(#fig-v60-cone)" stroke="var(--maybe)" strokeWidth="1.2" fill="none">
        <path d="M58 30c8 20 20 38 34 60M78 30c6 18 14 36 22 58M112 30c-2 18-4 36-6 58M132 30c-6 20-14 40-22 60M146 30c-10 20-22 40-34 62" />
      </g>
      <path d="M56 26 95 92M144 26l-39 66" stroke={paper} strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
      <path d="M70 64h60l-22 28H92z" fill={grounds} />
      <path d="M44 30h12M144 30h12M50 30l38 63h7M150 30l-38 63h-7" {...line} />
      <path d="M72 93h56v6H72z" {...line} fill={body} />
      <Drops />
      <Callout n={1} x={64} y={46} tx={18} ty={36} />
      <Callout n={2} x={100} y={94} tx={172} ty={92} />
      <Callout n={3} x={142} y={30} tx={182} ty={22} />
      <Callout n={4} x={92} y={136} tx={22} ty={128} />
    </Svg>
  )
}

function Kalita() {
  return (
    <Svg>
      <Server />
      <path d="M48 30h104l-26 58H74z" fill={body} />
      <path d="M56 26l3 6-3 6 3 6-3 6 3 6-3 6 3 6-3 6 3 6 19 4M144 26l-3 6 3 6-3 6 3 6-3 6 3 6-3 6 3 6-3 6-19 4" stroke={paper} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M66 70h68l-9 17H75z" fill={grounds} />
      <path d="M42 30h12M146 30h12M48 30l26 58h52l26-58" {...line} />
      <path d="M72 88h56v8H72z" {...line} fill={body} />
      <g fill="var(--bg)" stroke={ink} strokeWidth="1.2">
        <rect x="86" y="88" width="4" height="8" />
        <rect x="98" y="88" width="4" height="8" />
        <rect x="110" y="88" width="4" height="8" />
      </g>
      <Drops x={88} y={102} />
      <Drops x={112} y={102} />
      <Callout n={1} x={100} y={86} tx={22} ty={72} />
      <Callout n={2} x={112} y={94} tx={178} ty={96} />
      <Callout n={3} x={144} y={44} tx={182} ty={30} />
      <Callout n={4} x={92} y={136} tx={22} ty={128} />
    </Svg>
  )
}

function Chemex() {
  return (
    <Svg>
      <path d="M58 14h84L108 74v6l38 52a10 10 0 0 1-8 14H62a10 10 0 0 1-8-14l38-52v-6z" fill={glass} />
      <path d="M58 118h84l4 14a10 10 0 0 1-8 14H62a10 10 0 0 1-8-14z" fill={brew} opacity="0.85" />
      <path d="M64 8h72L104 68h-8z" fill="none" stroke={paper} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M78 44h44l-18 24h-8z" fill={grounds} />
      <path d="M58 14h84L108 74v6l38 52a10 10 0 0 1-8 14H62a10 10 0 0 1-8-14l38-52v-6z" {...line} />
      <path d="M58 14l8 14" {...line} />
      <path d="M85 70h30l6 10-6 10H85l-6-10z" fill={wood} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M121 80c8 2 10 8 8 14" fill="none" stroke={ink} strokeWidth="1.2" />
      <circle cx="129" cy="97" r="3" fill={wood} stroke={ink} strokeWidth="1.2" />
      <Callout n={1} x={128} y={20} tx={176} ty={30} />
      <Callout n={2} x={100} y={84} tx={170} ty={70} />
      <Callout n={3} x={62} y={22} tx={22} ty={10} />
      <Callout n={4} x={70} y={130} tx={24} ty={120} />
    </Svg>
  )
}

function AeroPress() {
  return (
    <Svg h={170}>
      <path d="M80 8h40v4h-3v58H83V12h-3z" fill={body} />
      <path d="M83 64h34v8H83z" fill="#3a3330" />
      <path d="M76 56h48v82H76z" fill={glass} />
      <path d="M78 74h44v62H78z" fill={brew} opacity="0.85" />
      <g fill={grounds}>
        {[[84, 128], [92, 124], [104, 130], [114, 126], [88, 116], [110, 118], [98, 120]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2" />)}
      </g>
      <path d="M80 8h40v4h-3v58H83V12h-3z" {...line} />
      <path d="M76 56h48v82H76z" {...line} />
      <path d="M72 56h56" {...line} />
      <g stroke={ink} strokeWidth="1">
        <path d="M118 90h6M118 104h6M118 118h6" />
      </g>
      <path d="M78 136h44" stroke={paper} strokeWidth="2" />
      <path d="M72 138h56v6H72z" {...line} fill={metal} />
      <path d="M70 148h60v12a8 8 0 0 1-8 8H78a8 8 0 0 1-8-8z" {...line} fill={body} />
      <Callout n={1} x={100} y={30} tx={30} ty={22} />
      <Callout n={2} x={84} y={68} tx={30} ty={58} />
      <Callout n={3} x={124} y={96} tx={170} ty={90} />
      <Callout n={4} x={120} y={136} tx={170} ty={122} />
      <Callout n={5} x={76} y={141} tx={30} ty={140} />
    </Svg>
  )
}

function FrenchPress() {
  return (
    <Svg>
      <path d="M62 34h76v104a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8z" fill={glass} />
      <path d="M63 62h74v76a7 7 0 0 1-7 7H70a7 7 0 0 1-7-7z" fill={brew} opacity="0.85" />
      <path d="M64 128h72v10a7 7 0 0 1-7 7H71a7 7 0 0 1-7-7z" fill={grounds} />
      <path d="M62 34h76v104a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8z" {...line} />
      <path d="M138 50c16 0 18 8 18 30s-2 34-18 34" {...line} strokeWidth="2.6" />
      <path d="M58 26h84v8H58z" {...line} fill={metal} />
      <path d="M100 8v52M94 8h12" {...line} strokeWidth="2" />
      <path d="M64 60l4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3" stroke={ink} strokeWidth="1.3" fill="none" />
      <Callout n={1} x={120} y={61} tx={176} ty={56} />
      <Callout n={2} x={100} y={20} tx={36} ty={14} />
      <Callout n={3} x={64} y={90} tx={26} ty={84} />
      <Callout n={4} x={90} y={136} tx={26} ty={128} />
    </Svg>
  )
}

function Clever() {
  return (
    <Svg>
      <path d="M48 22h104l-30 64H78z" fill={body} />
      <path d="M60 42h80l-20 42H80z" fill={brew} opacity="0.85" />
      <path d="M68 62h64l-12 22H80z" fill={grounds} />
      <path d="M54 18 82 82M146 18l-28 64" stroke={paper} strokeWidth="1.6" strokeDasharray="3 2" fill="none" />
      <path d="M42 22h12M146 22h12M48 22l30 64h44l30-64" {...line} />
      <path d="M72 86h56v6H72z" {...line} fill={body} />
      <path d="M92 86h16" stroke="var(--bg)" strokeWidth="3" />
      <path d="M90 82h20v-4H90z" fill={metal} stroke={ink} strokeWidth="1.2" />
      <path d="M100 92v8" stroke={ink} strokeWidth="1.4" />
      <path d="M64 100h72v34a12 12 0 0 1-12 12H76a12 12 0 0 1-12-12z" {...line} fill={glass} />
      <path d="M66 126h68v8a10 10 0 0 1-10 10H76a10 10 0 0 1-10-10z" fill={brew} opacity="0.85" />
      <path d="M96 106l4-5 4 5" {...line} strokeWidth="1.2" />
      <Callout n={1} x={100} y={80} tx={174} ty={74} />
      <Callout n={2} x={144} y={24} tx={182} ty={14} />
      <Callout n={3} x={100} y={100} tx={170} ty={112} />
      <Callout n={4} x={84} y={56} tx={22} ty={48} />
    </Svg>
  )
}

function Moka() {
  return (
    <Svg>
      <path d="M68 28h64l-6 54H74z" fill={body} />
      <path d="M75 66h50l-1 16H76z" fill={brew} opacity="0.85" />
      <path d="M96 82V44h8v38" fill={metal} stroke={ink} strokeWidth="1.3" />
      <path d="M66 96h68l8 54H58z" fill={body} />
      <path d="M64 112h72l6 38H58z" fill={water} />
      <path d="M76 88h48v14l-20 6H96l-20-6z" fill={grounds} stroke={ink} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M98 108v38h4v-38" fill={metal} stroke={ink} strokeWidth="1.1" />
      <path d="M68 28h64l-6 54H74zM66 96h68l8 54H58zM72 82h56v14H72z" {...line} />
      <path d="M64 22h72v6H64z" {...line} fill={metal} />
      <path d="M132 34c14 0 22 8 22 26" {...line} strokeWidth="3" />
      <path d="M66 30l-10 6" {...line} />
      <circle cx="140" cy="106" r="3.5" fill={metal} stroke={ink} strokeWidth="1.3" />
      <path d="M50 156h100" stroke={ink} strokeWidth="1.2" />
      <path d="M86 156c0-6 4-6 4-10M100 156c0-6 4-6 4-10M114 156c0-6 4-6 4-10" stroke="#e0703a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Callout n={1} x={70} y={130} tx={26} ty={134} />
      <Callout n={2} x={142} y={106} tx={178} ty={116} />
      <Callout n={3} x={78} y={94} tx={26} ty={98} />
      <Callout n={4} x={104} y={50} tx={176} ty={56} />
      <Callout n={5} x={74} y={46} tx={26} ty={46} />
    </Svg>
  )
}

function Espresso() {
  return (
    <Svg h={170}>
      <path d="M46 8h108v34H46z" fill={metal} />
      <path d="M46 8h108v34H46z" {...line} />
      <g stroke={water} strokeWidth="2.4" strokeLinecap="round">
        <path d="M80 16v14M100 16v14M120 16v14" />
      </g>
      <path d="M76 26l4 5 4-5M96 26l4 5 4-5M116 26l4 5 4-5" stroke={ink} strokeWidth="1.2" fill="none" />
      <path d="M62 42h76" stroke={ink} strokeWidth="2" strokeDasharray="2 2" />
      <path d="M58 46h84v10a20 20 0 0 1-20 20H78a20 20 0 0 1-20-20z" fill={body} />
      <path d="M66 46h68v10a14 14 0 0 1-14 14H80a14 14 0 0 1-14-14z" fill={grounds} />
      <path d="M58 46h84v10a20 20 0 0 1-20 20H78a20 20 0 0 1-20-20z" {...line} />
      <path d="M142 58h50v8h-50" {...line} fill="#3a3330" />
      <path d="M90 76v8l-6 8M110 76v8l6 8" {...line} />
      <path d="M84 94v24M116 94v24" stroke={brew} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M70 120h60v22a12 12 0 0 1-12 12H82a12 12 0 0 1-12-12z" {...line} fill={body} />
      <path d="M72 128h56v14a10 10 0 0 1-10 10H82a10 10 0 0 1-10-10z" fill={brew} opacity="0.85" />
      <path d="M72 128h56" stroke="#c9975f" strokeWidth="3" />
      <Callout n={1} x={60} y={24} tx={20} ty={20} />
      <Callout n={2} x={70} y={42} tx={20} ty={44} />
      <Callout n={3} x={100} y={60} tx={20} ty={70} />
      <Callout n={4} x={170} y={62} tx={180} ty={86} />
      <Callout n={5} x={114} y={88} tx={170} ty={110} />
    </Svg>
  )
}

function Burrs() {
  return (
    <Svg>
      {/* Conical: a toothed cone turning inside a ring that narrows toward the bottom */}
      <path d="M20 44h14l8 66H30zM80 44H66l-8 66h12z" fill={metal} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M36 54l4 2M36 66l5 2M37 78l5 2M38 90l5 2M39 102l5 2M64 54l-4 2M64 66l-5 2M63 78l-5 2M62 90l-5 2M61 102l-5 2" stroke={ink} strokeWidth="1" />
      <path d="M50 50 36 106h28z" fill={body} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M46 66l8-4M43 78l14-6M41 90l18-7M38 102l24-8" stroke={ink} strokeWidth="1" />
      <path d="M50 106v20" {...line} strokeWidth="2.4" />
      <g fill={grounds}><ellipse cx="44" cy="30" rx="4" ry="5.5" /><ellipse cx="56" cy="26" rx="4" ry="5.5" /></g>
      <g fill={grounds}>{[38, 46, 54, 62].map((x) => <circle key={x} cx={x} cy={120} r="1.4" />)}</g>
      {/* Flat: two toothed discs facing each other */}
      <path d="M118 62h68v12h-68zM118 86h68v12h-68z" fill={metal} />
      <path d="M118 74l4 4 4-4 4 4 4-4 4 4 4-4M158 74l4 4 4-4 4 4 4-4 4 4 4-4M118 86l4-4 4 4 4-4 4 4 4-4 4 4M158 86l4-4 4 4 4-4 4 4 4-4 4 4" stroke={ink} strokeWidth="1.1" fill="none" />
      <path d="M118 62h68v12h-68zM118 86h68v12h-68z" {...line} />
      <path d="M152 50v12M152 98v24" {...line} strokeWidth="2.4" />
      <path d="M192 74v12M189 77l3-3 3 3M189 83l3 3 3-3" stroke="var(--accent)" strokeWidth="1.4" fill="none" />
      <g fill={grounds}><ellipse cx="146" cy="40" rx="4" ry="5.5" /><ellipse cx="158" cy="36" rx="4" ry="5.5" /></g>
      <g fill={grounds}>{[112, 108, 196, 200].map((x, i) => <circle key={x} cx={x - (i < 2 ? 0 : 8)} cy={80} r="1.4" />)}</g>
      <Callout n={1} x={47} y={80} tx={14} ty={140} />
      <Callout n={2} x={130} y={68} tx={130} ty={140} />
      <Callout n={3} x={192} y={80} tx={186} ty={140} />
    </Svg>
  )
}

function Cezve() {
  return (
    <Svg>
      <path d="M62 40c6 6 8 12 6 20-6 20-16 34-16 56a14 14 0 0 0 14 14h48a14 14 0 0 0 14-14c0-22-10-36-16-56-2-8 0-14 6-20z" fill={metal} />
      <path d="M58 90h64c4 10 6 18 6 26a14 14 0 0 1-14 14H66a14 14 0 0 1-14-14c0-8 2-16 6-26z" fill={brew} opacity="0.9" />
      <path d="M68 62c8-4 36-4 44 0l-4 14c-12-4-24-4-36 0z" fill="#c9975f" />
      <path d="M64 76h52c2 6 4 10 6 14H58c2-4 4-8 6-14z" fill={brew} opacity="0.9" />
      <path d="M62 40c6 6 8 12 6 20-6 20-16 34-16 56a14 14 0 0 0 14 14h48a14 14 0 0 0 14-14c0-22-10-36-16-56-2-8 0-14 6-20" {...line} />
      <path d="M56 38l8 3M124 38l-8 3" {...line} />
      <path d="M118 66l70-24" {...line} strokeWidth="4" />
      <path d="M64 146h52" stroke={ink} strokeWidth="1.2" />
      <path d="M82 146c0-5 3-5 3-8M98 146c0-5 3-5 3-8M114 146c0-5 3-5 3-8" stroke="#e0703a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Callout n={1} x={68} y={118} tx={24} ty={116} />
      <Callout n={2} x={82} y={66} tx={24} ty={58} />
      <Callout n={3} x={160} y={52} tx={176} ty={78} />
      <Callout n={4} x={100} y={140} tx={160} ty={146} />
    </Svg>
  )
}

function KettleScale() {
  return (
    <Svg>
      {/* Gooseneck kettle pouring into a dripper on a scale */}
      <path d="M18 70h52v52a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" fill={metal} />
      <path d="M18 70h52v52a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" {...line} />
      <path d="M24 70v-6h40v6M38 58h12v6H38z" {...line} />
      <path d="M18 84c-10 0-12 8-12 16s2 16 12 16" {...line} strokeWidth="3" />
      <path d="M70 118c18-2 18-30 22-50 2-12 10-22 24-24" {...line} strokeWidth="3" />
      <path d="M118 46c2 6 2 14 0 24" stroke={water} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <rect x="28" y="96" width="16" height="10" rx="2" fill="var(--bg)" stroke={ink} strokeWidth="1" />
      <path d="M98 74h40l-12 22h-16z" {...line} fill={body} />
      <path d="M100 96h36v24a6 6 0 0 1-6 6h-24a6 6 0 0 1-6-6z" {...line} fill={glass} />
      <path d="M86 128h64v10H86z" {...line} fill={metal} />
      <rect x="104" y="130" width="28" height="6" rx="1" fill="var(--bg)" stroke={ink} strokeWidth="0.8" />
      <Callout n={1} x={88} y={80} tx={84} ty={24} />
      <Callout n={2} x={36} y={101} tx={30} ty={146} />
      <Callout n={3} x={118} y={133} tx={176} ty={146} />
    </Svg>
  )
}

const FIGURES: Record<string, () => ReactNode> = {
  v60: V60,
  kalita: Kalita,
  chemex: Chemex,
  aeropress: AeroPress,
  frenchPress: FrenchPress,
  clever: Clever,
  moka: Moka,
  espresso: Espresso,
  burrs: Burrs,
  cezve: Cezve,
  kettleScale: KettleScale,
}

export function Figure({ id }: { id: string }) {
  const Draw = FIGURES[id]
  return Draw ? <Draw /> : null
}
