import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { trackScan } from "@/lib/analytics"
import { checkRateLimit, cacheGet, cacheSet } from "@/lib/redis"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  const rl = await checkRateLimit(`scan:${ip}`, 30, 60).catch(() => ({
    allowed: true,
    remaining: 30,
    resetAt: 0,
  }))

  if (!rl.allowed) {
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  const cacheKey = `qr:${slug}`
  const cached = await cacheGet<{ id: string; targetUrl: string }>(cacheKey).catch(() => null)

  let targetUrl: string
  let qrCodeId: string

  if (cached) {
    targetUrl = cached.targetUrl
    qrCodeId = cached.id
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
    await cacheSet(cacheKey, { id: qr.id, targetUrl: qr.targetUrl }, 300).catch(() => {})
  }

  trackScan(qrCodeId, request).catch(() => {})

  return NextResponse.redirect(targetUrl, { status: 302 })
}
