import QRCode from "qrcode"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://qr.somar.ia.br"

export function buildQrUrl(slug: string): string {
  return `${BASE_URL}/${slug}`
}

export async function generateQRCodeDataURL(
  slug: string,
  color: string = "#EF3B2C"
): Promise<string> {
  const url = buildQrUrl(slug)
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: color,
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  })
}

export async function generateQRCodeSVG(
  slug: string,
  color: string = "#EF3B2C"
): Promise<string> {
  const url = buildQrUrl(slug)
  return QRCode.toString(url, {
    type: "svg",
    width: 400,
    margin: 2,
    color: {
      dark: color,
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  })
}

export function generateSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let slug = ""
  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)]
  }
  return slug
}
