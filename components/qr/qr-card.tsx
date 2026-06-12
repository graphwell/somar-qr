"use client"

import { useState } from "react"
import Link from "next/link"
import { QRCode } from "@prisma/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { QrCode as QrCodeIcon, MoreHorizontal, BarChart2, Download, Trash2, Edit, ExternalLink, ScanLine } from "lucide-react"
import { toast } from "sonner"
import { deleteQRCode, toggleQRCode } from "@/actions/qr"
import { formatRelative, formatNumber } from "@/lib/utils"
import { EditQRDialog } from "@/components/qr/edit-qr-dialog"
import Image from "next/image"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://qr.somar.ia.br"

export function QRCodeCard({ qr }: { qr: QRCode }) {
  const [active, setActive] = useState(qr.isActive)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  async function handleToggle() {
    const res = await toggleQRCode(qr.id)
    if (res.error) {
      toast.error(res.error)
    } else {
      setActive(res.isActive!)
    }
  }

  async function handleDelete() {
    if (!confirm("Deletar este QR code permanentemente?")) return
    setDeleting(true)
    const res = await deleteQRCode(qr.id)
    if (res.error) {
      toast.error(res.error)
      setDeleting(false)
    } else {
      toast.success("QR code deletado.")
    }
  }

  function handleDownload() {
    const a = document.createElement("a")
    a.href = `/api/qr/${qr.id}/image`
    a.download = `${qr.slug}.png`
    a.click()
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${qr.color}20` }}
              >
                <QrCodeIcon className="h-4 w-4" style={{ color: qr.color }} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{qr.name}</p>
                <p className="text-xs text-muted-foreground truncate">{formatRelative(qr.createdAt)}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm hover:bg-accent transition-colors outline-none">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
                  <Edit className="h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" /> Download PNG
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => window.location.href = `/qr/${qr.id}`}>
                  <BarChart2 className="h-4 w-4" /> Ver analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-600"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" /> Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-center py-2">
            <Image
              src={`/api/qr/${qr.id}/image`}
              alt={`QR ${qr.name}`}
              width={120}
              height={120}
              className="rounded"
              unoptimized
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 rounded px-2 py-1.5">
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <a
              href={`${BASE_URL}/${qr.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-foreground transition-colors"
            >
              {BASE_URL}/{qr.slug}
            </a>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <ScanLine className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{formatNumber(qr.totalScans)}</span>
              <span className="text-muted-foreground text-xs">scans</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={active ? "default" : "secondary"} className="text-xs">
                {active ? "Ativo" : "Inativo"}
              </Badge>
              <Switch checked={active} onCheckedChange={handleToggle} />
            </div>
          </div>
        </CardContent>
      </Card>

      <EditQRDialog qr={qr} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
