import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QRCodeCard } from "@/components/qr/qr-card"
import { CreateQRDialog } from "@/components/qr/create-qr-dialog"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const [qrCodes, subscription] = await Promise.all([
    prisma.qRCode.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ])

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus QR Codes</h1>
          <p className="text-muted-foreground">
            {qrCodes.length}/{subscription?.qrCodesLimit ?? 5} QR codes utilizados
          </p>
        </div>
        <CreateQRDialog>
          <Button style={{ backgroundColor: "#EF3B2C" }} className="text-white hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Novo QR Code
          </Button>
        </CreateQRDialog>
      </div>

      <StatsCards
        totalQR={qrCodes.length}
        totalScans={totalScans}
        activeQR={qrCodes.filter((q) => q.isActive).length}
        plan={subscription?.plan ?? "FREE"}
      />

      {qrCodes.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-4">Nenhum QR code ainda.</p>
          <CreateQRDialog>
            <Button style={{ backgroundColor: "#EF3B2C" }} className="text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro QR code
            </Button>
          </CreateQRDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr) => (
            <QRCodeCard key={qr.id} qr={qr} />
          ))}
        </div>
      )}
    </div>
  )
}
