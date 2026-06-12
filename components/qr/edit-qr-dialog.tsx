"use client"

import { useState, useEffect } from "react"
import { QRCode } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateQRCode } from "@/actions/qr"

const BG_PRESETS = [
  { label: "Branco", bg: "#FFFFFF" },
  { label: "Preto", bg: "#000000" },
  { label: "Cinza", bg: "#F3F4F6" },
  { label: "Transparente", bg: "#00000000" },
]

interface EditQRDialogProps {
  qr: QRCode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditQRDialog({ qr, open, onOpenChange }: EditQRDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: qr.name,
    targetUrl: qr.targetUrl,
    description: qr.description || "",
    color: qr.color,
    bgColor: qr.bgColor ?? "#FFFFFF",
  })

  useEffect(() => {
    setForm({
      name: qr.name,
      targetUrl: qr.targetUrl,
      description: qr.description || "",
      color: qr.color,
      bgColor: qr.bgColor ?? "#FFFFFF",
    })
  }, [qr])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await updateQRCode({ id: qr.id, ...form })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("QR code atualizado!")
        onOpenChange(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar QR Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>URL de destino</Label>
            <Input
              type="url"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Cores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cor do QR</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-9 w-12 rounded cursor-pointer border"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor do fundo</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.bgColor === "#00000000" ? "#ffffff" : form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="h-9 w-12 rounded cursor-pointer border"
                />
                <Input
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="font-mono text-xs"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Presets de fundo */}
          <div className="space-y-2">
            <Label>Presets de fundo</Label>
            <div className="flex gap-2 flex-wrap">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.bg}
                  type="button"
                  onClick={() => setForm({ ...form, bgColor: p.bg })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    form.bgColor === p.bg
                      ? "border-[#EF3B2C] ring-1 ring-[#EF3B2C]"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-gray-300 inline-block"
                    style={{
                      background:
                        p.bg === "#00000000"
                          ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 6px 6px"
                          : p.bg,
                    }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview mini */}
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-gray-50">
            <div
              className="h-10 w-10 rounded flex items-center justify-center border"
              style={{
                background:
                  form.bgColor === "#00000000"
                    ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 6px 6px"
                    : form.bgColor,
              }}
            >
              <svg viewBox="0 0 10 10" width="28" height="28" fill={form.color}>
                <rect x="0" y="0" width="4" height="4" />
                <rect x="6" y="0" width="4" height="4" />
                <rect x="0" y="6" width="4" height="4" />
                <rect x="2" y="2" width="2" height="2" fill={form.bgColor === "#00000000" ? "transparent" : form.bgColor} />
                <rect x="7" y="7" width="2" height="2" />
                <rect x="4" y="4" width="1" height="1" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">
              Prévia: módulos <b style={{ color: form.color }}>{form.color}</b> • fundo <b>{form.bgColor}</b>
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white"
              style={{ backgroundColor: "#EF3B2C" }}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
