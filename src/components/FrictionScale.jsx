import { Smile, Meh, Frown, AlertTriangle, Ban } from 'lucide-react'
import { FRICTION_LABELS } from '../lib/storage.js'

const ICONS = {
  1: Smile,
  2: Smile,
  3: Meh,
  4: Frown,
  5: Ban,
}

const COLORS = {
  1: 'from-emerald-500/30 to-emerald-500/10 border-emerald-500/60 text-emerald-300',
  2: 'from-lime-500/30 to-lime-500/10 border-lime-500/60 text-lime-300',
  3: 'from-amber-500/30 to-amber-500/10 border-amber-500/60 text-amber-300',
  4: 'from-orange-500/30 to-orange-500/10 border-orange-500/60 text-orange-300',
  5: 'from-rose-500/30 to-rose-500/10 border-rose-500/60 text-rose-300',
}

export default function FrictionScale({ value, onChange }) {
  return (
    <div>
      <label className="field-label">
        Escala de Fricção <span className="text-rose-400">*</span>
      </label>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => {
          const Icon = ICONS[n] || (n === 4 ? AlertTriangle : Meh)
          const selected = value === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={selected}
              aria-label={`${n} - ${FRICTION_LABELS[n]}`}
              className={[
                'group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 py-4 sm:py-5',
                'transition active:scale-[0.97]',
                selected
                  ? `bg-gradient-to-br ${COLORS[n]} shadow-lg`
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200',
              ].join(' ')}
            >
              <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.2} />
              <span className="text-2xl font-extrabold leading-none">{n}</span>
              <span className="text-[11px] sm:text-xs font-medium leading-tight text-center">
                {FRICTION_LABELS[n]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
