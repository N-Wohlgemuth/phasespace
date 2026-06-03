import { writable, get } from 'svelte/store'
import { token } from './auth'

const API = 'http://localhost:3000'

export type Preset = {
  id?:   number
  name:  string
  m:     number
  k:     number
  gamma: number
  x0:    number
  p0:    number
  mode:  string
}

export const presetList  = writable<Preset[]>([])
export const presetError = writable<string | null>(null)

function headers() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${get(token)}`,
  }
}

export async function loadPresets() {
  presetError.set(null)
  const res = await fetch(`${API}/presets`, { headers: headers() })
  if (!res.ok) { presetError.set('Fehler beim Laden'); return }
  presetList.set(await res.json())
}

export async function savePreset(preset: Omit<Preset, 'id'>): Promise<boolean> {
  presetError.set(null)
  const res = await fetch(`${API}/presets`, {
    method:  'POST',
    headers: headers(),
    body:    JSON.stringify(preset),
  })
  if (!res.ok) { presetError.set('Fehler beim Speichern'); return false }
  await loadPresets()
  return true
}

export async function removePreset(name: string): Promise<boolean> {
  presetError.set(null)
const res = await fetch(`${API}/presets/${encodeURIComponent(name)}`, {
  method:  'DELETE',
  headers: { 'Authorization': `Bearer ${get(token)}` },  // kein Content-Type
})
  if (!res.ok) { presetError.set('Fehler beim Löschen'); return false }
  presetList.update(l => l.filter(p => p.name !== name))
  return true
}

export async function renamePreset(oldName: string, newName: string): Promise<boolean> {
  presetError.set(null)
  const res = await fetch(`${API}/presets/${encodeURIComponent(oldName)}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${get(token)}` },
    body:    JSON.stringify({ newName }),
  })
  if (!res.ok) { presetError.set('Fehler beim Umbenennen'); return false }
  presetList.update(l => l.map(p => p.name === oldName ? { ...p, name: newName } : p))
  return true
}
