import { useState } from 'react'
import {
  Building2,
  FileSignature,
  LayoutGrid,
  MessageSquareQuote,
  Lightbulb,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react'
import FrictionScale from './FrictionScale.jsx'
import { PORTAL_AREAS, SERVICE_TYPES, addEntry } from '../lib/storage.js'

const EMPTY = {
  clientId: '',
  contractId: '',
  serviceType: '',
  portalArea: '',
  friction: 0,
  verbatim: '',
  insight: '',
}

export default function FeedbackForm({ onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [submitError, setSubmitError] = useState(null)

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.clientId.trim()) e.clientId = 'Obrigatório'
    if (!form.contractId.trim()) e.contractId = 'Obrigatório'
    if (!form.serviceType) e.serviceType = 'Selecione o serviço'
    if (!form.portalArea) e.portalArea = 'Selecione uma área'
    if (!form.friction) e.friction = 'Indique o nível de fricção'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitError(null)
    setStatus('submitting')
    try {
      await addEntry({
        clientId: form.clientId.trim(),
        contractId: form.contractId.trim(),
        serviceType: form.serviceType,
        portalArea: form.portalArea,
        friction: Number(form.friction),
        verbatim: form.verbatim.trim(),
        insight: form.insight.trim(),
      })
    } catch (err) {
      console.error('Falha ao registar feedback:', err)
      setSubmitError(err?.message || 'Não foi possível registar. Tente novamente.')
      setStatus('idle')
      return
    }
    setStatus('success')
    onSaved?.()
    setTimeout(() => {
      setForm(EMPTY)
      setStatus('idle')
    }, 1800)
  }

  if (status === 'success') {
    return (
      <div className="card p-8 sm:p-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 ring-4 ring-red-500/30">
          <CheckCircle2 className="h-12 w-12 text-red-400" strokeWidth={2.4} />
        </div>
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-red-400">
          Feedback registado!
        </h2>
        <p className="mt-2 text-slate-300 text-lg">
          Obrigado, João. Este insight vai ajudar a equipa a corrigir o portal.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Identificação B2B */}
      <section className="card p-5 sm:p-7">
        <header className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">Identificação B2B</h2>
            <p className="text-sm text-slate-400">Quem é o cliente que reportou.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="clientId">
              ID de Cliente <span className="text-rose-400">*</span>
            </label>
            <input
              id="clientId"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ex: 100482"
              className={`field-input ${errors.clientId ? 'border-rose-500/70 focus:ring-rose-500/40' : ''}`}
              value={form.clientId}
              onChange={(e) => setField('clientId', e.target.value)}
            />
            {errors.clientId && (
              <p className="mt-1.5 text-sm text-rose-400">{errors.clientId}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="contractId">
              ID de Contrato <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <FileSignature className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                id="contractId"
                type="text"
                autoComplete="off"
                placeholder="Ex: CTR-2025-0091"
                className={`field-input pl-11 ${errors.contractId ? 'border-rose-500/70 focus:ring-rose-500/40' : ''}`}
                value={form.contractId}
                onChange={(e) => setField('contractId', e.target.value)}
              />
            </div>
            {errors.contractId && (
              <p className="mt-1.5 text-sm text-rose-400">{errors.contractId}</p>
            )}
          </div>
        </div>
      </section>

      {/* Contexto + Fricção */}
      <section className="card p-5 sm:p-7 space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">Contexto do Portal</h2>
            <p className="text-sm text-slate-400">Onde aconteceu e quão difícil foi.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="serviceType">
              Serviço Principal <span className="text-rose-400">*</span>
            </label>
            <select
              id="serviceType"
              className={`field-input appearance-none ${errors.serviceType ? 'border-rose-500/70 focus:ring-rose-500/40' : ''}`}
              value={form.serviceType}
              onChange={(e) => setField('serviceType', e.target.value)}
            >
              <option value="" disabled>Escolher serviço…</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="mt-1.5 text-sm text-rose-400">{errors.serviceType}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="portalArea">
              Área do portal <span className="text-rose-400">*</span>
            </label>
            <select
              id="portalArea"
              className={`field-input appearance-none ${errors.portalArea ? 'border-rose-500/70 focus:ring-rose-500/40' : ''}`}
              value={form.portalArea}
              onChange={(e) => setField('portalArea', e.target.value)}
            >
              <option value="" disabled>Escolher área…</option>
              {PORTAL_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            {errors.portalArea && (
              <p className="mt-1.5 text-sm text-rose-400">{errors.portalArea}</p>
            )}
          </div>
        </div>

        <div>
          <FrictionScale
            value={form.friction}
            onChange={(n) => setField('friction', n)}
          />
          {errors.friction && (
            <p className="mt-2 text-sm text-rose-400">{errors.friction}</p>
          )}
        </div>
      </section>

      {/* Voz do cliente + Insight */}
      <section className="card p-5 sm:p-7 space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">Voz do Cliente</h2>
            <p className="text-sm text-slate-400">O que disse, e o que o João viu.</p>
          </div>
        </header>

        <div>
          <label className="field-label" htmlFor="verbatim">
            Verbatim — o que o cliente disse
          </label>
          <textarea
            id="verbatim"
            rows={3}
            placeholder='“Eu carrego o ficheiro e nunca chega nada ao destinatário…”'
            className="field-input resize-none"
            value={form.verbatim}
            onChange={(e) => setField('verbatim', e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="insight">
            <span className="inline-flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Insight Operacional (João)
            </span>
          </label>
          <textarea
            id="insight"
            rows={3}
            placeholder="O que está a falhar do ponto de vista logístico/operacional?"
            className="field-input resize-none"
            value={form.insight}
            onChange={(e) => setField('insight', e.target.value)}
          />
        </div>
      </section>

      {/* CTA */}
      {submitError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="group flex w-full items-center justify-center gap-3 rounded-2xl
                   bg-red-600 px-6 py-5 text-lg font-bold text-white
                   shadow-[0_8px_30px_-8px_rgba(220,38,38,0.6)]
                   transition hover:bg-red-500 active:scale-[0.99]
                   disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            A registar…
          </>
        ) : (
          <>
            <Send className="h-6 w-6" />
            Submeter Contacto
          </>
        )}
      </button>
    </form>
  )
}
