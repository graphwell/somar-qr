import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { trackScan } from "@/lib/analytics"
import { redis, rateLimit } from "@/lib/redis"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  const { success } = await rateLimit(`scan:${ip}`, 30, 60).catch(() => ({
    success: true,
    remaining: 30,
  }))

  if (!success) {
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  const cacheKey = `qr:${slug}`
  const cached = await redis.get(cacheKey).catch(() => null)

  let targetUrl: string
  let qrCodeId: string

  if (cached) {
    const data = JSON.parse(cached)
    targetUrl = data.targetUrl
    qrCodeId = data.id
  } else {
    const qr = await prisma.qRCode.findUnique({
      where: { slug },
      select: { id: true, targetUrl: true, isActive: true },
    })

    if (!qr || !qr.isActive) {
      return NextResponse.redirect(new URL("/not-found", request.url))
    }

    targetUrl = qr.targetUrl
    qrCodeId = qr.id
    await redis
      .setex(cacheKey, 300, JSON.stringify({ id: qr.id, targetUrl: qr.targetUrl }))
      .catch(() => {})
  }

  trackScan(qrCodeId, request).catch(() => {})

  return NextResponse.redirect(targetUrl, { status: 302 })
}
