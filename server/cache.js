// Simple in-memory cache with expiry
const cache = new Map()

const CACHE_TTL = 1000 * 60 * 30   // 30 minutes in milliseconds

export function getCached(key) {
  const entry = cache.get(key)

  // Entry doesn't exist
  if (!entry) return null

  // Entry has expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }

  console.log('Cache HIT:', key.slice(0, 40) + '...')
  return entry.value
}

export function setCached(key, value) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL
  })
  console.log('Cache SET:', key.slice(0, 40) + '...')
}

export function getCacheStats() {
  return {
    size: cache.size,
    keys: [...cache.keys()].map(k => k.slice(0, 30) + '...')
  }
}