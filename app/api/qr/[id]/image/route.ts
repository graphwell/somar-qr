import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateQRCodeBuffer } from "@/lib/qr"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params
  const qr = await prisma.qRCode.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!qr) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const buffer = await generateQRCodeBuffer(qr.slug, qr.color)
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${qr.slug}.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
