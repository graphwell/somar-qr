"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail } from "@/lib/email"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Dados inválidos." }
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existing) {
    return { error: "Email já cadastrado." }
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      subscription: {
        create: { plan: "FREE", qrCodesLimit: 5, scansLimit: 1000 },
      },
    },
  })

  try {
    await sendWelcomeEmail(user.email, user.name || "usuário")
  } catch {}

  return { success: true }
}
