export type ApiError = { status: number; message: string; details?: unknown }

const rawApiBase = (import.meta.env.VITE_API_BASE_URL as string) || ""
export const API_BASE = rawApiBase.replace(/\/+$/, '')

// Persist access and refresh tokens in localStorage per request.
// Keys used:
const ACCESS_TOKEN_KEY = 'mocka_access_token'
const REFRESH_TOKEN_KEY = 'mocka_refresh_token'
const FULLNAME_KEY = 'mocka_full_name'

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  else localStorage.removeItem(ACCESS_TOKEN_KEY)
  if (refreshToken !== undefined) {
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    else localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
  try { window.dispatchEvent(new CustomEvent('auth:change')) } catch {}
}

export function setFullName(name: string | null) {
  if (name) localStorage.setItem(FULLNAME_KEY, name)
  else localStorage.removeItem(FULLNAME_KEY)
  try { window.dispatchEvent(new CustomEvent('auth:change')) } catch {}
}

export function getFullName() {
  return localStorage.getItem(FULLNAME_KEY)
}

export function clearFullName() {
  localStorage.removeItem(FULLNAME_KEY)
  try { window.dispatchEvent(new CustomEvent('auth:change')) } catch {}
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  try { window.dispatchEvent(new CustomEvent('auth:change')) } catch {}
}

// Helper: extract validation messages from ApiError-like objects
export function extractValidationMessages(err: any): string[] | null {
  try {
    if (!err) return null
    if (err.status !== 422) return null
    // Some backends send a simple array in details
    const payload = err.details
    const collectStrings = (value: any): string[] => {
      if (!value) return []
      if (Array.isArray(value)) {
        // array of strings or array of objects
        const out: string[] = []
        for (const v of value) {
          if (typeof v === 'string') out.push(v)
          else if (v && typeof v === 'object') {
            if (typeof v.message === 'string') out.push(v.message)
            else if (Array.isArray(v.messages)) out.push(...v.messages.filter((x: any) => typeof x === 'string'))
            else if (v.field && v.messages && Array.isArray(v.messages)) out.push(...v.messages.filter((x: any) => typeof x === 'string'))
          }
        }
        return out
      }
      if (typeof value === 'object') {
        // object keyed by field -> array of messages
        const out: string[] = []
        for (const k of Object.keys(value)) {
          const val = value[k]
          if (Array.isArray(val)) out.push(...val.filter((x: any) => typeof x === 'string'))
          else if (typeof val === 'string') out.push(val)
        }
        return out
      }
      if (typeof value === 'string') return [value]
      return []
    }

    // Common payload locations
    const candidates = [payload, err?.details?.details, err?.details?.errors, err?.errors, err?.messages, err?.detail]
    for (const c of candidates) {
      const found = collectStrings(c)
      if (found && found.length) return found
    }
  } catch {}
  return null
}

// Map validation messages (like "Password: ...") to a field -> messages array.
export function mapValidationErrors(err: any): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  try {
    const pushToKey = (k: string, v: string) => {
      const key = k.replace(/\s+/g, '').toLowerCase()
      if (!out[key]) out[key] = []
      out[key].push(v)
    }

    const payload = err?.details || err?.errors || err?.messages || err

    // Helper: normalize a field name into a key used by inputs
    const normalizeKey = (f: string) => f.replace(/[^a-z0-9]/gi, '').toLowerCase()

    if (!payload) return out

    const processStringArray = (arr: any[]) => {
      for (const mRaw of arr) {
        if (typeof mRaw !== 'string') continue
        const m = mRaw
        const match = m.match(/^\s*([^:]+)\s*:\s*(.*)$/s)
        if (match) pushToKey(normalizeKey(match[1]), match[2].trim())
        else {
          if (!out['_global']) out['_global'] = []
          out['_global'].push(m)
        }
      }
    }

    // Check common nested locations first (arrays of strings)
    const candidateArrays = [
      err?.details,
      err?.details?.details,
      err?.details?.errors,
      err?.errors,
      err?.messages,
      err?.detail,
      payload,
    ]
    for (const c of candidateArrays) {
      if (Array.isArray(c) && c.length && c.every((x: any) => typeof x === 'string' || (x && typeof x === 'object'))) {
        // If array of strings or objects
        // If array of strings -> process
        if (c.every((x: any) => typeof x === 'string')) {
          processStringArray(c)
          return out
        }
        // If array of objects
        for (const item of c) {
          if (!item) continue
          if (typeof item === 'string') {
            processStringArray([item])
            continue
          }
          const field = item.field || item.name || item.key || item.keyName || item.param
          if (field && item.message) pushToKey(normalizeKey(String(field)), String(item.message))
          else if (field && item.messages && Array.isArray(item.messages)) {
            for (const m of item.messages) if (typeof m === 'string') pushToKey(normalizeKey(String(field)), m)
          } else if (Array.isArray(item.messages)) {
            processStringArray(item.messages)
          } else if (Array.isArray(item.details)) {
            processStringArray(item.details)
          }
        }
        return out
      }
    }

    // If payload is an object keyed by field -> messages
    if (typeof payload === 'object') {
      for (const k of Object.keys(payload)) {
        const val = payload[k]
        const key = normalizeKey(k)
        if (Array.isArray(val)) {
          for (const v of val) if (typeof v === 'string') pushToKey(key, v)
        } else if (typeof val === 'string') {
          pushToKey(key, val)
        } else if (val && typeof val === 'object') {
          // nested object like { details: [...] }
          if (Array.isArray(val.messages)) for (const m of val.messages) if (typeof m === 'string') pushToKey(key, m)
          else if (Array.isArray(val.details)) for (const m of val.details) if (typeof m === 'string') pushToKey(key, m)
        }
      }
      return out
    }

    return out
  } catch {
    return out
  }
}

export function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    // Base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return null as unknown as T
  try {
    return JSON.parse(text) as T
  } catch {
    // If not JSON, return raw text
    return text as unknown as T
  }
}

async function handleRes<T>(res: Response): Promise<T> {
  if (res.ok) return parseJson<T>(res)
  const payload = await parseJson<any>(res).catch(() => null)
  const message = payload?.message || res.statusText || "Request failed"
  const err: ApiError = { status: res.status, message, details: payload }
  throw err
}

type RequestOpts = {
  headers?: Record<string, string>
  query?: Record<string, string | number | boolean | null | undefined>
  signal?: AbortSignal
}

function buildUrl(path: string, query?: RequestOpts['query']) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  if (!query) return url
  const params = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    params.append(k, String(v))
  })
  const s = params.toString()
  return s ? `${url}${url.includes('?') ? '&' : '?'}${s}` : url
}

async function request<T>(method: string, path: string, body?: any, opts?: RequestOpts): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts?.headers || {}) }
  const access = getAccessToken()
  if (access) headers['Authorization'] = `Bearer ${access}`

  const fetchOpts: RequestInit = { method, headers, signal: opts?.signal }
  if (body !== undefined) fetchOpts.body = JSON.stringify(body)

  const url = buildUrl(path, opts?.query)

  let res = await fetch(url, fetchOpts)

  // If 401 on a protected endpoint, try to refresh then retry once.
  const needsRefresh = res.status === 401 && ['/api/doc', '/api/mock', '/api/auth/refresh'].some(ep => path.startsWith(ep) || url.includes(ep))
  if (needsRefresh && !path.includes('/api/auth/refresh')) {
  const payload = access ? decodeJwtPayload(access) : null
  // prefer 'nameid' claim, then userId/sub
  const userId = payload?.nameid || payload?.userId || payload?.sub || null
    const refreshed = await tryRefresh(userId)
    if (refreshed) {
      // retry original request once
      const newAccess = getAccessToken()
      if (newAccess) headers['Authorization'] = `Bearer ${newAccess}`
      res = await fetch(url, { ...fetchOpts, headers })
    }
  }

  return handleRes<T>(res)
}

export async function tryRefresh(userId: string | number | null) {
  try {
    const refresh = getRefreshToken()
    if (!refresh) return false
    const body: any = { refreshToken: refresh }
    if (userId !== undefined && userId !== null) {
      // include both keys that backends might expect
      body.userId = userId
      body.nameid = userId
    }
    // Send the refresh token in the body; server returns new tokens in JSON.
    const res = await fetch(buildUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return false
    const payload = await parseJson<any>(res).catch(() => null)
    if (!payload) return false
    if (payload.accessToken || payload.refreshToken) {
  setTokens(payload.accessToken || null, payload.refreshToken ?? null)
  // persist full name if provided
  if (payload.FullName || payload.fullName || payload.full_name) setFullName(payload.FullName || payload.fullName || payload.full_name)
  else setFullName(null)
      return true
    }
    return false
  } catch {
    return false
  }
}

export const api = {
  get: <T = any>(path: string, opts?: RequestOpts) => request<T>('GET', path, undefined, opts),
  post: <T = any>(path: string, body?: any, opts?: RequestOpts) => request<T>('POST', path, body, opts),
  put: <T = any>(path: string, body?: any, opts?: RequestOpts) => request<T>('PUT', path, body, opts),
  del: <T = any>(path: string, opts?: RequestOpts) => request<T>('DELETE', path, undefined, opts),
}

// Auth endpoints from provided OpenAPI
export const authApi = {
  register: (payload: { firstName?: string; lastName?: string; username?: string; password?: string }) =>
    api.post<{ accessToken?: string; refreshToken?: string }>('/api/auth/register', payload),
  login: (payload: { username?: string; password?: string }) =>
    api.post<{ accessToken?: string; refreshToken?: string }>('/api/auth/login', payload),
  refresh: (payload: { refreshToken?: string }) =>
    api.post<{ accessToken?: string; refreshToken?: string }>('/api/auth/refresh', payload),
}

// Documentation upload endpoint
export const docApi = {
  uploadDoc: (form: FormData) => {
    // Multipart form upload — include Authorization and credentials. We must
    // not set Content-Type so the browser adds the proper boundary.
    const headers: Record<string, string> = {}
    const access = getAccessToken()
    if (access) headers['Authorization'] = `Bearer ${access}`
    return fetch(buildUrl('/api/doc'), { method: 'POST', body: form, headers })
      .then(async (res) => {
        if (res.status === 401) {
          // try refresh and retry once
          const payload = access ? decodeJwtPayload(access) : null
          const userId = payload?.nameid || payload?.userId || payload?.sub || null
          const refreshed = await tryRefresh(userId)
          if (refreshed) {
            const newAccess = getAccessToken()
            const retryHeaders: Record<string, string> = {}
            if (newAccess) retryHeaders['Authorization'] = `Bearer ${newAccess}`
            return fetch(buildUrl('/api/doc'), { method: 'POST', body: form, headers: retryHeaders }).then(handleRes)
          }
        }
        return handleRes(res)
      })
  },
}

// Mock generation endpoint
export const mockApi = {
  generate: (payload: { docId: number; ltHours?: number; ltDays?: number; ltWeeks?: number }) =>
    api.post<{ token?: string; expiryDate?: string }>('/api/mock', payload),
}

// Usage examples (in your components/pages):
// import { usersApi, api } from '@/lib/api'
// const res = await usersApi.list()
// const single = await usersApi.get(1)

// Add other API groups here:
// export const authApi = { login: (creds) => api.post('/auth/login', creds) }
