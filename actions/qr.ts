"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/qr"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const createQRSchema = z.object({
  name: z.string().min(1).max(100),
  targetUrl: z.string().url(),
  description: z.string().optional(),
  color: z.string().default("#EF3B2C"),
  slug: z.string().optional(),
})

const updateQRSchema = createQRSchema.partial().extend({
  id: z.string(),
})

async function getAuthUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Não autenticado")
  return session.user
}

export async function createQRCode(data: z.infer<typeof createQRSchema>) {
  const user = await getAuthUser()
  const parsed = createQRSchema.parse(data)

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })
  const count = await prisma.qRCode.count({ where: { userId: user.id } })
  if (sub && count >= sub.qrCodesLimit) {
    return { error: "Limite de QR codes atingido. Faça upgrade do plano." }
  }

  let slug = parsed.slug || generateSlug()
  const existing = await prisma.qRCode.findUnique({ where: { slug } })
  if (existing) {
    if (parsed.slug) return { error: "Slug já em uso." }
    slug = generateSlug()
  }

  const qr = await prisma.qRCode.create({
    data: {
      userId: user.id,
      slug,
      name: parsed.name,
      targetUrl: parsed.targetUrl,
      description: parsed.description,
      color: parsed.color,
    },
  })

  revalidatePath("/dashboard")
  return { success: true, qr }
}

export async function updateQRCode(data: z.infer<typeof updateQRSchema>) {
  const user = await getAuthUser()
  const parsed = updateQRSchema.parse(data)

  const qr = await prisma.qRCode.findFirst({
    where: { id: parsed.id, userId: user.id },
  })
  if (!qr) return { error: "QR code não encontrado." }

  const updated = await prisma.qRCode.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      targetUrl: parsed.targetUrl,
      description: parsed.description,
      color: parsed.color,
    },
  })

  revalidatePath("/dashboard")
  return { success: true, qr: updated }
}

export async function deleteQRCode(id: string) {
  const user = await getAuthUser()

  const qr = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  })
  if (!qr) return { error: "QR code não encontrado." }

  await prisma.qRCode.delete({ where: { id } })
  revalidatePath("/dashboard")
  return { success: true }
}

export async function toggleQRCode(id: string) {
  const user = await getAuthUser()

  const qr = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
  })
  if (!qr) return { error: "QR code não encontrado." }

  const updated = await prisma.qRCode.update({
    where: { id },
    data: { isActive: !qr.isActive },
  })

  revalidatePath("/dashboard")
  return { success: true, isActive: updated.isActive }
}

export async function getUserQRCodes() {
  const user = await getAuthUser()
  return prisma.qRCode.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function getQRCodeWithAnalytics(id: string) {
  const user = await getAuthUser()

  const qr = await prisma.qRCode.findFirst({
    where: { id, userId: user.id },
    include: {
      analytics: {
        orderBy: { scannedAt: "desc" },
        take: 50,
      },
    },
  })

  if (!qr) return null
  return qr
}
