export default function SummaryCard({ icon: Icon, label, value, hint, accent = 'emerald' }) {
  const accents = {
    emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  }
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
        {value}
      </p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  )
}
