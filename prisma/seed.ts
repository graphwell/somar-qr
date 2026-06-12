import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!connectionString) throw new Error("DATABASE_URL ou DIRECT_URL não definido")

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding...")

  // Admin
  const adminPassword = await bcrypt.hash("admin123@", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@somar.ia.br" },
    update: {},
    create: {
      name: "Admin Somar",
      email: "admin@somar.ia.br",
      password: adminPassword,
      role: "ADMIN",
      subscription: {
        create: {
          plan: "ENTERPRISE",
          qrCodesLimit: 999999,
          scansLimit: 999999,
        },
      },
    },
  })
  console.log("Admin criado:", admin.email)

  // Demo user
  const userPassword = await bcrypt.hash("demo123@", 12)
  const demo = await prisma.user.upsert({
    where: { email: "demo@somar.ia.br" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@somar.ia.br",
      password: userPassword,
      role: "USER",
      subscription: {
        create: {
          plan: "PRO",
          qrCodesLimit: 50,
          scansLimit: 50000,
        },
      },
    },
  })
  console.log("Demo user criado:", demo.email)

  // QR codes demo
  const qrs = [
    {
      slug: "site-somar",
      name: "Site Somar",
      targetUrl: "https://somar.ia.br",
      color: "#EF3B2C",
    },
    {
      slug: "cardapio-demo",
      name: "Cardápio Demo",
      targetUrl: "https://exemplo.com/cardapio",
      color: "#1D4ED8",
    },
    {
      slug: "promo-verao",
      name: "Promoção Verão",
      targetUrl: "https://exemplo.com/promo",
      color: "#059669",
    },
  ]

  for (const qr of qrs) {
    await prisma.qRCode.upsert({
      where: { slug: qr.slug },
      update: { targetUrl: qr.targetUrl },
      create: {
        userId: demo.id,
        slug: qr.slug,
        name: qr.name,
        targetUrl: qr.targetUrl,
        color: qr.color,
        isActive: true,
        totalScans: Math.floor(Math.random() * 200),
      },
    })
    console.log("QR criado:", qr.slug)
  }

  // SystemSettings
  await prisma.systemSettings.upsert({
    where: { key: "app_name" },
    update: {},
    create: { key: "app_name", value: "Somar QR" },
  })
  await prisma.systemSettings.upsert({
    where: { key: "base_url" },
    update: {},
    create: { key: "base_url", value: "https://qr.somar.ia.br" },
  })

  console.log("Seed concluído!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
