import { UAParser } from "ua-parser-js"
import { prisma } from "@/lib/prisma"

export async function trackScan(
  qrCodeId: string,
  request: Request
): Promise<void> {
  const userAgent = request.headers.get("user-agent") || ""
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  const referer = request.headers.get("referer") || ""

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  await Promise.all([
    prisma.qRAnalytics.create({
      data: {
        qrCodeId,
        ip,
        userAgent,
        browser: result.browser.name,
        os: result.os.name,
        device: result.device.type || "desktop",
        referer,
      },
    }),
    prisma.qRCode.update({
      where: { id: qrCodeId },
      data: { totalScans: { increment: 1 } },
    }),
  ])
}

export async function getAnalyticsSummary(qrCodeId: string) {
  const [total, byBrowser, byOS, byDevice, recentScans] = await Promise.all([
    prisma.qRAnalytics.count({ where: { qrCodeId } }),
    prisma.qRAnalytics.groupBy({
      by: ["browser"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.qRAnalytics.groupBy({
      by: ["os"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.qRAnalytics.groupBy({
      by: ["device"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.qRAnalytics.findMany({
      where: { qrCodeId },
      orderBy: { scannedAt: "desc" },
      take: 10,
    }),
  ])

  return { total, byBrowser, byOS, byDevice, recentScans }
}
