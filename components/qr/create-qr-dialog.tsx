"use client"

import { useState, cloneElement, isValidElement } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createQRCode } from "@/actions/qr"

export function CreateQRDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    targetUrl: "",
    description: "",
    color: "#EF3B2C",
    slug: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createQRCode(form)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("QR code criado com sucesso!")
        setOpen(false)
        setForm({ name: "", targetUrl: "", description: "", color: "#EF3B2C", slug: "" })
      }
    } finally {
      setLoading(false)
    }
  }

  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
        onClick: () => setOpen(true),
      })
    : <span onClick={() => setOpen(true)}>{children}</span>

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar novo QR Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Cardápio do restaurante"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>URL de destino *</Label>
              <Input
                type="url"
                placeholder="https://exemplo.com/cardapio"
                value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug personalizado (opcional)</Label>
              <Input
                placeholder="meu-cardapio (gerado automaticamente)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor do QR</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-10 w-16 rounded cursor-pointer border"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="font-mono"
                  maxLength={7}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 text-white"
                style={{ backgroundColor: "#EF3B2C" }}
                disabled={loading}
              >
                {loading ? "Criando..." : "Criar QR Code"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
