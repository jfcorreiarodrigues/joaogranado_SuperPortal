import { useMemo, useState } from 'react'
import {
  Users,
  Activity,
  AlertTriangle,
  Search,
  Trash2,
  Inbox,
  Calendar,
} from 'lucide-react'
import SummaryCard from './SummaryCard.jsx'
import FrictionByAreaChart from './FrictionByAreaChart.jsx'
import { FRICTION_LABELS, deleteEntry } from '../lib/storage.js'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function frictionPill(level) {
  const map = {
    1: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    2: 'bg-lime-500/15 text-lime-300 ring-lime-500/30',
    3: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    4: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
    5: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${map[level] || ''}`}
    >
      <span className="tabular-nums">{level}</span>
      <span className="hidden sm:inline">· {FRICTION_LABELS[level]}</span>
    </span>
  )
}

export default function Dashboard({ entries, onChanged }) {
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.clientId.toLowerCase().includes(q) ||
        e.contractId.toLowerCase().includes(q),
    )
  }, [entries, filter])

  const totals = useMemo(() => {
    const total = entries.length
    const avg =
      total === 0
        ? 0
        : entries.reduce((s, e) => s + (e.friction || 0), 0) / total

    const byArea = entries.reduce((acc, e) => {
      acc[e.portalArea] = (acc[e.portalArea] || 0) + 1
      return acc
    }, {})
    const topArea =
      Object.entries(byArea).sort((a, b) => b[1] - a[1])[0] || null

    // bipartite period: most recent 14 days window
    const since = Date.now() - 14 * 24 * 60 * 60 * 1000
    const inWindow = entries.filter((e) => new Date(e.createdAt).getTime() >= since).length

    return { total, avg, topArea, inWindow }
  }, [entries])

  const handleDelete = (id) => {
    if (!confirm('Eliminar este registo?')) return
    deleteEntry(id)
    onChanged?.()
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Users}
          label="Total de contactos"
          value={totals.total}
          hint={totals.total === 1 ? '1 registo' : `${totals.total} registos`}
        />
        <SummaryCard
          icon={Calendar}
          label="Últimos 14 dias"
          value={totals.inWindow}
          hint="Janela quinzenal"
          accent="red"
        />
        <SummaryCard
          icon={Activity}
          label="Média de dificuldade"
          value={totals.total ? totals.avg.toFixed(1) : '—'}
          hint={
            totals.total
              ? FRICTION_LABELS[Math.round(totals.avg)] || ''
              : 'sem dados'
          }
          accent={totals.avg >= 3.5 ? 'rose' : 'amber'}
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Área mais problemática"
          value={totals.topArea ? totals.topArea[0] : '—'}
          hint={totals.topArea ? `${totals.topArea[1]} contactos` : 'sem dados'}
          accent="rose"
        />
      </section>

      {/* Gráfico */}
      <FrictionByAreaChart entries={entries} />

      {/* Tabela */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              Todos os contactos
            </h3>
            <p className="text-sm text-slate-400">
              {filtered.length} de {entries.length} registos
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="search"
              placeholder="Filtrar por ID Cliente / Contrato"
              className="field-input pl-11"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/80 text-slate-400">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-200">
              Ainda sem contactos registados
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Vai a “Registar Contacto” para começar.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400">
            Nenhum registo corresponde ao filtro.
          </div>
        ) : (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Data</th>
                  <th className="px-5 py-3 font-semibold">Cliente</th>
                  <th className="px-5 py-3 font-semibold">Contrato</th>
                  <th className="px-5 py-3 font-semibold">Serviço</th>
                  <th className="px-5 py-3 font-semibold">Área</th>
                  <th className="px-5 py-3 font-semibold">Fricção</th>
                  <th className="px-5 py-3 font-semibold">Verbatim</th>
                  <th className="px-5 py-3 font-semibold">Insight</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                      {formatDate(e.createdAt)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-100 whitespace-nowrap">
                      {e.clientId}
                    </td>
                    <td className="px-5 py-3 text-slate-300 whitespace-nowrap">
                      {e.contractId}
                    </td>
                    <td className="px-5 py-3 text-slate-300 whitespace-nowrap">
                      {e.serviceType || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200">
                        {e.portalArea}
                      </span>
                    </td>
                    <td className="px-5 py-3">{frictionPill(e.friction)}</td>
                    <td className="px-5 py-3 max-w-[260px] text-slate-300">
                      <p className="line-clamp-2">{e.verbatim || '—'}</p>
                    </td>
                    <td className="px-5 py-3 max-w-[260px] text-slate-300">
                      <p className="line-clamp-2">{e.insight || '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-rose-500/60 hover:text-rose-300 transition"
                        aria-label="Eliminar registo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
