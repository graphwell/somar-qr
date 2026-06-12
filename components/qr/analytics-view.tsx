"use client"

import Link from "next/link"
import { QRCode, QRAnalytics } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ScanLine, Monitor, Smartphone, Globe } from "lucide-react"
import { formatDate, formatNumber } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type QRWithAnalytics = QRCode & { analytics: QRAnalytics[] }

function groupBy(items: QRAnalytics[], key: keyof QRAnalytics) {
  const counts: Record<string, number> = {}
  for (const item of items) {
    const val = (item[key] as string) || "Desconhecido"
    counts[val] = (counts[val] || 0) + 1
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

export function QRAnalyticsView({ qr }: { qr: QRWithAnalytics }) {
  const byBrowser = groupBy(qr.analytics, "browser")
  const byOS = groupBy(qr.analytics, "os")
  const byDevice = groupBy(qr.analytics, "device")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{qr.name}</h1>
          <p className="text-sm text-muted-foreground">/{qr.slug}</p>
        </div>
        <Badge variant={qr.isActive ? "default" : "secondary"} className="ml-auto">
          {qr.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ScanLine className="h-4 w-4" /> Total de Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(qr.totalScans)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Monitor className="h-4 w-4" /> Desktop vs Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {byDevice.find((d) => d.name === "desktop")?.value ?? 0} /{" "}
              {byDevice.find((d) => d.name === "mobile")?.value ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" /> URL de destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={qr.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#EF3B2C] hover:underline truncate block"
            >
              {qr.targetUrl}
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Por Navegador</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byBrowser} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#EF3B2C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Por Sistema Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byOS} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#EF3B2C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Últimos Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {qr.analytics.slice(0, 20).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{a.browser || "?"} / {a.os || "?"}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(a.scannedAt)}</span>
              </div>
            ))}
            {qr.analytics.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum scan ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
