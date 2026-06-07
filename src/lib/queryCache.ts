type CacheEntry<T> = { data: T; at: number }

const cache = new Map<string, CacheEntry<unknown>>()
const TTL = 30_000 // 30초

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() - entry.at > TTL) { cache.delete(key); return null }
  return entry.data
}

export function setCached<T>(key: string, data: T) {
  cache.set(key, { data, at: Date.now() })
}

export function invalidateCache(key: string) {
  cache.delete(key)
}
