import { useEffect, useState } from 'react'
import { ClipboardList, BarChart3, Mail } from 'lucide-react'
import FeedbackForm from './components/FeedbackForm.jsx'
import Dashboard from './components/Dashboard.jsx'
import { loadEntries } from './lib/storage.js'

const TABS = [
  { id: 'register', label: 'Registar Feedback', icon: ClipboardList },
  { id: 'dashboard', label: 'Painel de Análise', icon: BarChart3 },
]

export default function App() {
  const [tab, setTab] = useState('register')
  const [entries, setEntries] = useState([])

  const refresh = () => setEntries(loadEntries())

  useEffect(() => {
    refresh()
    // Sincroniza entre separadores do browser
    const onStorage = (e) => {
      if (e.key === null || e.key.startsWith('ctt.feedback')) refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <Mail className="h-5 w-5" strokeWidth={2.6} />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-500">
                CTT Área de Cliente - Empresas
              </p>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-50">
                Voz do Cliente · Contrato de Correio
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400 ring-1 ring-slate-800">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            v1.0 — interna
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-auto max-w-6xl px-3 sm:px-6">
          <div
            role="tablist"
            aria-label="Secções principais"
            className="grid grid-cols-2 gap-2 pb-3"
          >
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={[
                    'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm sm:text-base font-semibold transition',
                    active
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-slate-900/70 text-slate-300 ring-1 ring-slate-800 hover:bg-slate-800/70 hover:text-slate-100',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {tab === 'register' ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50">
                Registar feedback do cliente
              </h2>
              <p className="mt-1 text-slate-400">
                Captura rápida — direta ao assunto. Regista insights de clientes com contrato de correio.
              </p>
            </div>
            <FeedbackForm onSaved={refresh} />
          </div>
        ) : (
          <div>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50">
                  Painel quinzenal
                </h2>
                <p className="mt-1 text-slate-400">
                  Síntese dos contactos registados e onde mais dói o portal.
                </p>
              </div>
            </div>
            <Dashboard entries={entries} onChanged={refresh} />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-center text-xs text-slate-500 sm:px-6">
        Feito para a equipa de Digital Experience · CTT · Dados guardados localmente neste dispositivo.
      </footer>
    </div>
  )
}
