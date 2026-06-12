"use client"

import { useState, useEffect } from "react"
import { QRCode } from "@prisma/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { QrCode as QrCodeIcon, MoreHorizontal, BarChart2, Download, Trash2, Edit, ExternalLink, ScanLine, FileImage, FileType2, FileCode2 } from "lucide-react"
import { toast } from "sonner"
import { deleteQRCode, toggleQRCode } from "@/actions/qr"
import { formatRelative, formatNumber } from "@/lib/utils"
import { EditQRDialog } from "@/components/qr/edit-qr-dialog"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://qr.somar.ia.br"

/** Renders an SVG string onto a <canvas> and resolves with the canvas element. */
function svgToCanvas(svgText: string, size: number, bgColor?: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!

    const img = new Image()
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      if (bgColor) {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, size, size)
      }
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.onerror = reject
    img.src = url
  })
}

export function QRCodeCard({ qr }: { qr: QRCode }) {
  const [active, setActive] = useState(qr.isActive)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [svgText, setSvgText] = useState<string>("")
  const [svgDataUrl, setSvgDataUrl] = useState<string>("")

  useEffect(() => {
    fetch(`/api/qr/${qr.id}/image`)
      .then((r) => r.text())
      .then((svg) => {
        setSvgText(svg)
        const encoded = encodeURIComponent(svg)
        setSvgDataUrl(`data:image/svg+xml,${encoded}`)
      })
      .catch(() => {})
  }, [qr.id])

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

  // SVG download
  function handleDownloadSVG() {
    const a = document.createElement("a")
    a.href = `/api/qr/${qr.id}/image`
    a.download = `${qr.slug}.svg`
    a.click()
  }

  // PNG — transparent background
  async function handleDownloadPNG() {
    if (!svgText) return toast.error("SVG ainda não carregado.")
    try {
      const canvas = await svgToCanvas(svgText, 1024) // no bgColor → transparent
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${qr.slug}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, "image/png")
    } catch {
      toast.error("Erro ao gerar PNG.")
    }
  }

  // JPG — white background
  async function handleDownloadJPG() {
    if (!svgText) return toast.error("SVG ainda não carregado.")
    try {
      const canvas = await svgToCanvas(svgText, 1024, "#ffffff")
      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${qr.slug}.jpg`
          a.click()
          URL.revokeObjectURL(url)
        },
        "image/jpeg",
        0.95
      )
    } catch {
      toast.error("Erro ao gerar JPG.")
    }
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

                {/* Download submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleDownloadSVG} className="gap-2">
                      <FileCode2 className="h-4 w-4 text-blue-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">SVG</span>
                        <span className="text-xs text-muted-foreground">Vetorial escalável</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPNG} className="gap-2">
                      <FileImage className="h-4 w-4 text-purple-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">PNG</span>
                        <span className="text-xs text-muted-foreground">Fundo transparente · 1024px</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadJPG} className="gap-2">
                      <FileType2 className="h-4 w-4 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">JPG</span>
                        <span className="text-xs text-muted-foreground">Fundo branco · 1024px</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

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
            {svgDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={svgDataUrl}
                alt={`QR ${qr.name}`}
                width={120}
                height={120}
                className="rounded"
              />
            ) : (
              <div className="h-[120px] w-[120px] rounded bg-gray-100 flex items-center justify-center">
                <QrCodeIcon className="h-8 w-8 text-gray-300" />
              </div>
            )}
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
