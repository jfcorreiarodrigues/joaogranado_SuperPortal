const STORAGE_KEY = 'ctt.feedback.entries.v1'

export const PORTAL_AREAS = [
  'Preparação de Envios',
  'Acompanhamento de Objetos',
  'Faturação e Pagamentos',
  'Pedidos de Consumíveis',
  'Gestão de Reclamações',
  'Outros',
]

export const SERVICE_TYPES = [
  'Correio Normal',
  'Correio Registado',
  'Correio Expresso / Encomendas',
  'Correio Internacional',
  'Misto / Vários',
]

export const FRICTION_LABELS = {
  1: 'Muito Fácil',
  2: 'Fácil',
  3: 'Médio',
  4: 'Difícil',
  5: 'Bloqueio Total',
}

export function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function addEntry(entry) {
  const entries = loadEntries()
  const next = [
    {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    },
    ...entries,
  ]
  saveEntries(next)
  return next
}

export function deleteEntry(id) {
  const next = loadEntries().filter((e) => e.id !== id)
  saveEntries(next)
  return next
}

export function clearEntries() {
  saveEntries([])
  return []
}
