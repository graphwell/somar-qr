import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function checkRateLimit(key: string, max: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000)
  const windowKey = `rl:${key}:${Math.floor(now / windowSeconds)}`
  const count = await redis.incr(windowKey)
  if (count === 1) await redis.expire(windowKey, windowSeconds)
  return {
    allowed: count <= max,
    remaining: Math.max(0, max - count),
    resetAt: (Math.floor(now / windowSeconds) + 1) * windowSeconds,
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return redis.get<T>(key)
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  await redis.setex(key, ttlSeconds, value as string)
}

export async function cacheDel(key: string) {
  await redis.del(key)
}

export async function cacheDelPattern(_pattern: string) {
  // Upstash não suporta KEYS — no-op
}
