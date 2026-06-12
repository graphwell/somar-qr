import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendWelcomeEmail(email: string, name: string) {
  await transporter.sendMail({
    from: `"Somar QR" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Bem-vindo ao Somar QR!",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#EF3B2C">Somar QR</h1>
        <p>Olá, ${name}!</p>
        <p>Sua conta foi criada com sucesso. Comece a criar seus QR codes dinâmicos permanentes agora.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background:#EF3B2C;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          Acessar painel
        </a>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`
  await transporter.sendMail({
    from: `"Somar QR" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Redefinição de senha — Somar QR",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#EF3B2C">Somar QR</h1>
        <p>Clique no link abaixo para redefinir sua senha. O link expira em 1 hora.</p>
        <a href="${url}" style="background:#EF3B2C;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">
          Redefinir senha
        </a>
        <p style="margin-top:24px;color:#666;font-size:12px">Se não solicitou isso, ignore este email.</p>
      </div>
    `,
  })
}
