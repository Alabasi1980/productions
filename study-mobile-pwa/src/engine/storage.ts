// Versioned, namespaced localStorage wrapper.
// Keys layout:  study:<domainId>:<packId>:<store>
// Schema version stored at: study:__schema__:version
// All access goes through this module — no direct localStorage anywhere else.

const ROOT = 'study'
const VERSION_KEY = `${ROOT}:__schema__:version`

export const CURRENT_SCHEMA_VERSION = 1

export type StorageScope = {
  domainId: string
  contentPackId: string
}

const DEFAULT_SCOPE: StorageScope = {
  domainId: 'erp-production',
  contentPackId: 'default',
}

let activeScope: StorageScope = { ...DEFAULT_SCOPE }

function scopedKey(name: string, scope: StorageScope = activeScope): string {
  return `${ROOT}:${scope.domainId}:${scope.contentPackId}:${name}`
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

// ─── Migration hook ────────────────────────────────────────────────
// Keep deliberately simple: a function gets the previous version number
// and is expected to perform any necessary localStorage rewrites in place.
// Returns the new version it migrated to.

export type Migration = (fromVersion: number) => void

const migrations: Record<number, Migration> = {
  // Example for future use:
  // 2: (from) => { /* rewrite keys, rename stores, etc. */ }
}

function readCurrentVersion(): number {
  if (typeof window === 'undefined') return CURRENT_SCHEMA_VERSION
  const raw = window.localStorage.getItem(VERSION_KEY)
  if (raw === null) return 0
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function writeCurrentVersion(version: number): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(VERSION_KEY, String(version))
}

export function runMigrations(): void {
  if (typeof window === 'undefined') return
  const current = readCurrentVersion()
  if (current >= CURRENT_SCHEMA_VERSION) {
    writeCurrentVersion(CURRENT_SCHEMA_VERSION)
    return
  }
  for (let v = current + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const fn = migrations[v]
    if (fn) fn(v - 1)
  }
  writeCurrentVersion(CURRENT_SCHEMA_VERSION)
}

// ─── Scope management ──────────────────────────────────────────────

export function setActiveScope(scope: Partial<StorageScope>): void {
  activeScope = { ...activeScope, ...scope }
}

export function getActiveScope(): StorageScope {
  return { ...activeScope }
}

// ─── Helpers (the only API the rest of the app should use) ─────────

export function get<T>(name: string, fallback: T, scope?: StorageScope): T {
  if (typeof window === 'undefined') return fallback
  return safeParse<T>(window.localStorage.getItem(scopedKey(name, scope)), fallback)
}

export function set<T>(name: string, value: T, scope?: StorageScope): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(scopedKey(name, scope), JSON.stringify(value))
}

export function has(name: string, scope?: StorageScope): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(scopedKey(name, scope)) !== null
}

export function remove(name: string, scope?: StorageScope): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(scopedKey(name, scope))
}
