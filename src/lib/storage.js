import { supabase } from './supabase.js'

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

export async function loadEntries() {
  const { data, error } = await supabase
    .from('feedback_entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(dbToEntry)
}

export async function addEntry(entry) {
  const { data, error } = await supabase
    .from('feedback_entries')
    .insert([entryToDb(entry)])
    .select()
    .single()
  if (error) throw error
  return dbToEntry(data)
}

export async function deleteEntry(id) {
  const { error } = await supabase
    .from('feedback_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function clearEntries() {
  const { error } = await supabase
    .from('feedback_entries')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

function entryToDb(e) {
  return {
    client_id: e.clientId,
    contract_id: e.contractId,
    service_type: e.serviceType,
    portal_area: e.portalArea,
    friction: e.friction,
    verbatim: e.verbatim ?? '',
    insight: e.insight ?? '',
  }
}

function dbToEntry(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    contractId: row.contract_id,
    serviceType: row.service_type,
    portalArea: row.portal_area,
    friction: row.friction,
    verbatim: row.verbatim,
    insight: row.insight,
    createdAt: row.created_at,
  }
}
