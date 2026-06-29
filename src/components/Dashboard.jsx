import { useMemo, useState, useCallback } from 'react'
import {
  Users,
  Activity,
  AlertTriangle,
  Search,
  Trash2,
  Inbox,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
} from 'lucide-react'
import * as XLSX from 'xlsx'
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
    1: 'bg-emerald-500/20 text-emerald-200 ring-emerald-500/40',
    2: 'bg-lime-500/20 text-lime-200 ring-lime-500/40',
    3: 'bg-amber-500/20 text-amber-200 ring-amber-500/40',
    4: 'bg-orange-500/20 text-orange-200 ring-orange-500/40',
    5: 'bg-rose-500/20 text-rose-200 ring-rose-500/40',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${map[level] || ''}`}
    >
      <span className="tabular-nums">{level}</span>
      <span>· {FRICTION_LABELS[level]}</span>
    </span>
  )
}

function DetailModal({ entry, onClose }) {
  if (!entry) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-slate-100">Detalhe do Contacto</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data</span>
            <p className="mt-1 text-sm text-slate-200">{formatDate(entry.createdAt)}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fricção</span>
            <div className="mt-1">{frictionPill(entry.friction)}</div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</span>
            <p className="mt-1 text-sm font-semibold text-slate-100">{entry.clientId}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contrato</span>
            <p className="mt-1 text-sm text-slate-200">{entry.contractId}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Serviço</span>
            <p className="mt-1 text-sm text-slate-200">{entry.serviceType || '—'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Área</span>
            <p className="mt-1 text-sm text-slate-200">{entry.portalArea}</p>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verbatim</span>
          <p className="mt-2 rounded-xl bg-slate-800/60 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {entry.verbatim || '—'}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Insight</span>
          <p className="mt-2 rounded-xl bg-slate-800/60 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {entry.insight || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ entries, onChanged }) {
  const [filter, setFilter] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [detailEntry, setDetailEntry] = useState(null)

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

    const since = Date.now() - 14 * 24 * 60 * 60 * 1000
    const inWindow = entries.filter((e) => new Date(e.createdAt).getTime() >= since).length

    return { total, avg, topArea, inWindow }
  }, [entries])

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este registo?')) return
    await deleteEntry(id)
    onChanged?.()
  }

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exportToExcel = useCallback(() => {
    const rows = filtered.map((e) => ({
      Data: formatDate(e.createdAt),
      Cliente: e.clientId,
      Contrato: e.contractId,
      'Serviço': e.serviceType || '',
      'Área': e.portalArea,
      'Fricção': e.friction,
      'Nível de Fricção': FRICTION_LABELS[e.friction] || '',
      Verbatim: e.verbatim || '',
      Insight: e.insight || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 26 },
      { wch: 8 },
      { wch: 16 },
      { wch: 50 },
      { wch: 50 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Feedback')
    XLSX.writeFile(wb, `feedback_ctt_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }, [filtered])

  return (
    <div className="space-y-6">
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

      <FrictionByAreaChart entries={entries} />

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
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <button
                onClick={exportToExcel}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                Exportar Excel
              </button>
            )}
            <div className="relative w-full sm:w-72">
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
              Vai a &ldquo;Registar Contacto&rdquo; para começar.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400">
            Nenhum registo corresponde ao filtro.
          </div>
        ) : (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-10 px-3 py-4"></th>
                  <th className="px-4 py-4 font-semibold">Data</th>
                  <th className="px-4 py-4 font-semibold">Cliente</th>
                  <th className="px-4 py-4 font-semibold">Contrato</th>
                  <th className="px-4 py-4 font-semibold">Serviço</th>
                  <th className="px-4 py-4 font-semibold">Área</th>
                  <th className="px-4 py-4 font-semibold">Fricção</th>
                  <th className="px-4 py-4 font-semibold">Verbatim</th>
                  <th className="px-4 py-4 font-semibold">Insight</th>
                  <th className="px-4 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((e) => {
                  const isExpanded = expandedRows.has(e.id)
                  return (
                    <tr key={e.id} className="group hover:bg-slate-800/30 transition">
                      <td className="px-3 py-4 align-top">
                        <button
                          onClick={() => toggleRow(e.id)}
                          className="rounded-lg p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition"
                          aria-label={isExpanded ? 'Recolher' : 'Expandir'}
                        >
                          {isExpanded
                            ? <ChevronUp className="h-4 w-4" />
                            : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap text-sm">
                        {formatDate(e.createdAt)}
                      </td>
                      <td className="px-4 py-4 align-top font-bold text-slate-50 whitespace-nowrap text-sm">
                        {e.clientId}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-200 whitespace-nowrap text-sm">
                        {e.contractId}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-200 whitespace-nowrap text-sm">
                        {e.serviceType || '—'}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="inline-block rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-100">
                          {e.portalArea}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">{frictionPill(e.friction)}</td>
                      <td className="px-4 py-4 align-top max-w-[320px] text-sm text-slate-200">
                        <p className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}>
                          {e.verbatim || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top max-w-[320px] text-sm text-slate-200">
                        <p className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}>
                          {e.insight || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailEntry(e)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-emerald-500/60 hover:text-emerald-300 transition"
                            aria-label="Ver detalhe"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-rose-500/60 hover:text-rose-300 transition"
                            aria-label="Eliminar registo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <DetailModal entry={detailEntry} onClose={() => setDetailEntry(null)} />
    </div>
  )
}
