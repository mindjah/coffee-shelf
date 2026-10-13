/**
 * Line drawing of a pour-over, animated while a label is being read: a kettle stream into a V60
 * dripper, drips falling, and coffee rising in the glass server. White lines; meant for a dark card.
 */
export function PourOver() {
  return (
    <svg className="pourover" viewBox="0 0 120 156" aria-hidden="true">
      <defs>
        {/* Inside of the server, so the coffee level stays within the glass. */}
        <clipPath id="server-inside">
          <path d="M45 88 L75 88 L77 95 Q90 106 88 123 Q86 140 70 140 L50 140 Q34 140 32 123 Q30 106 43 95 Z" />
        </clipPath>
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* kettle stream */}
        <path className="po-stream" d="M60 0 L60 30" />
        {/* V60: rim, cone, ribs, base ring and handle */}
        <path d="M26 30 L94 30" />
        <path d="M30 30 L52 66 L68 66 L90 30" />
        <path className="po-rib" d="M42 34 Q49 46 54 58 M78 34 Q71 46 66 58 M60 34 L60 60" />
        <path d="M46 70 L74 70 M50 66 L50 70 M70 66 L70 70" />
        <path d="M90 34 Q104 36 100 48 Q97 55 84 52" />
        {/* server: narrow neck, round glass body, spout, handle */}
        <path d="M44 84 L76 84 L78 93 Q92 105 90 123 Q88 143 70 143 L50 143 Q32 143 30 123 Q28 105 42 93 Z" />
        <path d="M44 84 Q41 82 38 83" />
        <path d="M44 80 L76 80" />
        <path d="M79 92 Q96 92 98 106 Q99 120 88 128" />
      </g>
      {/* drips from the dripper tip */}
      <g fill="currentColor">
        <circle className="po-drip" cx="60" cy="74" r="1.8" />
        <circle className="po-drip d2" cx="60" cy="74" r="1.8" />
        <circle className="po-drip d3" cx="60" cy="74" r="1.8" />
      </g>
      {/* coffee level rising in the server */}
      <g clipPath="url(#server-inside)">
        <rect className="po-coffee" x="26" y="88" width="68" height="55" fill="currentColor" />
      </g>
    </svg>
  )
}
