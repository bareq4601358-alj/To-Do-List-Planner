/** Decorative initials stamp for Bareq Aljuboori. */
export function BaStamp() {
  return (
    <svg
      className="ba-stamp"
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        className="ba-stamp__ring ba-stamp__ring--outer"
        cx="50"
        cy="50"
        r="46"
        fill="none"
      />
      <circle
        className="ba-stamp__ring ba-stamp__ring--inner"
        cx="50"
        cy="50"
        r="38"
        fill="none"
      />
      <path
        className="ba-stamp__notch"
        d="M50 6 L53 12 L47 12 Z"
        fill="currentColor"
      />
      <path
        className="ba-stamp__notch"
        d="M50 94 L53 88 L47 88 Z"
        fill="currentColor"
      />
      <text
        className="ba-stamp__letters"
        x="50"
        y="56"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        BA
      </text>
      <text
        className="ba-stamp__name"
        x="50"
        y="82"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        ALJUBOORI
      </text>
    </svg>
  )
}
