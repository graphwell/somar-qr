import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, ScanLine, Activity, Crown } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface StatsCardsProps {
  totalQR: number
  totalScans: number
  activeQR: number
  plan: string
}

export function StatsCards({ totalQR, totalScans, activeQR, plan }: StatsCardsProps) {
  const stats = [
    { title: "QR Codes", value: totalQR, icon: QrCode, description: "total criados" },
    { title: "Total de Scans", value: formatNumber(totalScans), icon: ScanLine, description: "todos os QR codes" },
    { title: "QR Ativos", value: activeQR, icon: Activity, description: "funcionando agora" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.title}
            </CardTitle>
            <s.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Plano</CardTitle>
          <Crown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge
            style={{ backgroundColor: "#EF3B2C" }}
            className="text-white text-sm"
          >
            {plan}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">plano atual</p>
        </CardContent>
      </Card>
    </div>
  )
}
