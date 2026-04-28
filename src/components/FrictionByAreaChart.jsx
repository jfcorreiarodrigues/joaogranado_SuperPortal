import { PORTAL_AREAS } from '../lib/storage.js'

const LEVELS = [
  { n: 1, label: '1 · Muito Fácil', color: 'bg-emerald-500' },
  { n: 2, label: '2 · Fácil', color: 'bg-lime-500' },
  { n: 3, label: '3 · Médio', color: 'bg-amber-500' },
  { n: 4, label: '4 · Difícil', color: 'bg-orange-500' },
  { n: 5, label: '5 · Bloqueio Total', color: 'bg-rose-500' },
]

export default function FrictionByAreaChart({ entries }) {
  // Build counts per area per friction level
  const matrix = PORTAL_AREAS.map((area) => {
    const byLevel = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    entries.forEach((e) => {
      if (e.portalArea === area && e.friction >= 1 && e.friction <= 5) {
        byLevel[e.friction] += 1
      }
    })
    const total = byLevel[1] + byLevel[2] + byLevel[3] + byLevel[4] + byLevel[5]
    return { area, byLevel, total }
  })

  const max = Math.max(1, ...matrix.map((r) => r.total))

  if (entries.length === 0) {
    return (
      <div className="card p-6 sm:p-8 text-center text-slate-400">
        Sem dados ainda. Regista o primeiro contacto para ver a distribuição.
      </div>
    )
  }

  return (
    <div className="card p-5 sm:p-7">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100">
            Distribuição de fricção por área
          </h3>
          <p className="text-sm text-slate-400">
            Empilhado por nível — mais vermelho, mais bloqueio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <div
              key={l.n}
              className="flex items-center gap-1.5 rounded-full bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-300"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {matrix.map((row) => {
          const widthPct = (row.total / max) * 100
          return (
            <div key={row.area}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">{row.area}</span>
                <span className="text-sm font-bold text-slate-300 tabular-nums">
                  {row.total}
                </span>
              </div>
              <div
                className="flex h-7 w-full overflow-hidden rounded-lg bg-slate-800/60"
                role="img"
                aria-label={`Total ${row.total} contactos em ${row.area}`}
              >
                {row.total === 0 ? (
                  <div className="flex w-full items-center justify-center text-xs text-slate-500">
                    sem registos
                  </div>
                ) : (
                  <div className="flex h-full" style={{ width: `${widthPct}%` }}>
                    {LEVELS.map((l) => {
                      const c = row.byLevel[l.n]
                      if (!c) return null
                      const pct = (c / row.total) * 100
                      return (
                        <div
                          key={l.n}
                          className={`${l.color} h-full flex items-center justify-center text-[11px] font-bold text-slate-950`}
                          style={{ width: `${pct}%` }}
                          title={`${l.label}: ${c}`}
                        >
                          {pct >= 12 ? c : ''}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
