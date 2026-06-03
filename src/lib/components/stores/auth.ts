import { writable, derived } from 'svelte/store'
import { loadPresets } from './presets'

const API = 'http://localhost:3000'

type User = { id: number; username: string }

const token = writable<string | null>(
  typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
)
const user = writable<User | null>(
  typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('user') ?? 'null') : null
)
export const authError  = writable<string | null>(null)
export const isLoggedIn = derived(token, t => t !== null)
export const isGuest    = derived(user, u => u?.username === 'gast')

function setSession(t: string, u: User) {
  token.set(t)
  user.set(u)
  localStorage.setItem('token', t)
  localStorage.setItem('user', JSON.stringify(u))
}

function clearSession() {
  token.set(null)
  user.set(null)
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getToken(): string | null {
  let t: string | null = null
  token.subscribe(v => t = v)()
  return t
}

export async function login(username: string, password: string): Promise<boolean> {
  authError.set(null)
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) { authError.set(data.error); return false }
  const payload = JSON.parse(atob(data.token.split('.')[1]))
  setSession(data.token, { id: payload.id, username: payload.username })
  return true
}

export async function register(username: string, password: string): Promise<boolean> {
  authError.set(null)
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) { authError.set(data.error); return false }
  const payload = JSON.parse(atob(data.token.split('.')[1]))
  setSession(data.token, { id: payload.id, username: payload.username })
  return true
}

export async function loginAsGuest(): Promise<boolean> {
  authError.set(null)
  const res = await fetch(`${API}/auth/guest`, { method: 'POST' })
  const data = await res.json()
  if (!res.ok) { authError.set(data.error); return false }
  const payload = JSON.parse(atob(data.token.split('.')[1]))
  setSession(data.token, { id: payload.id, username: payload.username })
  return true
}

// Beim Start automatisch Presets laden wenn Token vorhanden


if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
  loadPresets()
}

export function logout() {
  clearSession()
}

export { token, user }