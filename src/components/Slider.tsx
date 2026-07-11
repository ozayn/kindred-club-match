interface SliderProps {
  label: string
  low: string
  high: string
  blurb: string
  value: number
  onChange: (v: number) => void
  index: number
  total: number
}

export function Slider({ label, low, high, blurb, value, onChange, index, total }: SliderProps) {
  return (
    <div className="py-8 border-b border-[var(--line)] first:pt-0 last:border-b-0">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs tracking-widest uppercase text-[var(--muted)]">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <h3 className="font-display text-2xl mb-1">{label}</h3>
      <p className="text-sm text-[var(--muted)] mb-6 max-w-md">{blurb}</p>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <div className="flex justify-between mt-3 text-xs text-[var(--muted)]">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}
