import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { QRAnalyticsView } from "@/components/qr/analytics-view"

export default async function QRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const { id } = await params

  const qr = await prisma.qRCode.findFirst({
    where: { id, userId: session.user.id },
    include: {
      analytics: {
        orderBy: { scannedAt: "desc" },
        take: 100,
      },
    },
  })

  if (!qr) notFound()

  return <QRAnalyticsView qr={qr} />
}
