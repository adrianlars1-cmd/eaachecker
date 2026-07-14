export default function Logo({ className = '', showWordmark = true, dark = false }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M16 2L28 7V15C28 23 22 28.5 16 30C10 28.5 4 23 4 15V7L16 2Z"
          fill={dark ? '#818CF8' : '#4F46E5'}
        />
        <path
          d="M10 16.5L14 20.5L22 11.5"
          stroke="#22C55E"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          EAA<span className="text-indigo-600">Checker</span>
        </span>
      )}
    </span>
  )
}
