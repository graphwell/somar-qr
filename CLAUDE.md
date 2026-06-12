# Somar QR — CLAUDE.md

## Visão geral

SaaS de QR Codes Dinâmicos Permanentes. Um QR code impresso nunca muda; seu destino sim.

- **Domínio**: https://qr.somar.ia.br
- **Slug format**: `https://qr.somar.ia.br/{slug}` → redireciona para `targetUrl`
- **Cor da marca**: `#EF3B2C`

## Stack

| Camada        | Tecnologia                         |
|---------------|------------------------------------|
| Framework     | Next.js 16, App Router, TypeScript |
| UI            | Tailwind CSS + Shadcn UI (Base UI) |
| ORM           | Prisma 7 + @prisma/adapter-pg      |
| Banco         | Supabase (PostgreSQL)              |
| Auth          | NextAuth v4 (JWT + Credentials)    |
| Cache         | Upstash Redis (REST API)           |
| Deploy        | Vercel                             |
| Charts        | Recharts                           |

## Estrutura de diretórios

```
app/
  [slug]/route.ts          # Redirecionamento de QR + tracking de scans
  (auth)/login/page.tsx    # Login
  (auth)/register/page.tsx # Cadastro
  (dashboard)/
    layout.tsx             # Layout autenticado
    dashboard/page.tsx     # Lista de QR codes
    qr/[id]/page.tsx       # Analytics de um QR code
  api/
    auth/[...nextauth]/    # NextAuth handler
    qr/[id]/image/         # Download SVG do QR code
  page.tsx                 # Landing page pública

components/
  dashboard/nav.tsx        # Navbar autenticada
  dashboard/stats-cards.tsx
  qr/qr-card.tsx           # Card de QR code com ações
  qr/create-qr-dialog.tsx  # Modal de criação
  qr/edit-qr-dialog.tsx    # Modal de edição
  qr/analytics-view.tsx    # View de analytics
  providers.tsx            # SessionProvider + TooltipProvider

lib/
  prisma.ts    # PrismaClient com @prisma/adapter-pg (pooler Supabase)
  redis.ts     # Upstash Redis REST API + checkRateLimit + cache helpers
  auth.ts      # NextAuthOptions (JWT + Credentials)
  qr.ts        # Geração de QR codes (qrcode lib — SVG + data URL)
  analytics.ts # Tracking de scans via ua-parser-js
  email.ts     # Envio de emails via nodemailer
  utils.ts     # cn, formatDate, formatNumber, slugify

actions/
  auth.ts  # registerUser
  qr.ts    # CRUD + toggle de QR codes

prisma/schema.prisma  # Modelos: User, QRCode, QRAnalytics, Subscription, AuditLog
middleware.ts         # Proteção de rotas /dashboard, /qr, /admin
vercel.json           # Config de build para Vercel
```

## Modelos Prisma

- **User** — autenticação, role (USER/ADMIN)
- **Account/Session/VerificationToken** — NextAuth adapter
- **QRCode** — slug único, targetUrl, cor, isActive, totalScans
- **QRAnalytics** — browser, OS, device, IP por scan
- **Subscription** — plano (FREE/PRO/ENTERPRISE), limites
- **AuditLog** — log de ações
- **SystemSettings** — configurações key/value

## Variáveis de ambiente (.env / Vercel)

```env
# Supabase PostgreSQL
# DATABASE_URL: pooler (porta 6543, para runtime com PgBouncer)
# DIRECT_URL: conexão direta (porta 5432, para migrations)
DATABASE_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres"

# Upstash Redis (REST API — compatível com Vercel Edge)
UPSTASH_REDIS_REST_URL="https://[REF].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[TOKEN]"

# NextAuth — gere com: openssl rand -base64 32
NEXTAUTH_SECRET="change-me-in-production"
NEXTAUTH_URL="https://qr.somar.ia.br"

# App
NEXT_PUBLIC_BASE_URL="https://qr.somar.ia.br"

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu@gmail.com"
SMTP_PASS="sua-senha-de-app-gmail"
```

## Deploy na Vercel

```bash
# 1. Push para GitHub
git push origin master

# 2. Na Vercel, importe o repositório
# 3. Configure todas as variáveis de ambiente acima
# 4. Build command: prisma generate && next build  (já no vercel.json)
# 5. Deploy automático a cada push
```

## Migrations (Supabase)

```bash
# Localmente (com DIRECT_URL apontando para Supabase)
npx prisma migrate dev

# Produção
npx prisma migrate deploy
```

## Notas importantes

- **Shadcn v4 usa Base UI** — não suporta `asChild` prop. Use estado controlado para triggers de Dialog/Dropdown.
- **Prisma 7** — requer `@prisma/adapter-pg`. DATABASE_URL usa pooler (pgbouncer=true). DIRECT_URL para migrations.
- **Upstash Redis** — REST API, não TCP. Sem suporte a KEYS/scan pattern. cacheDelPattern é no-op.
- **QR codes** — exportados como SVG (sem canvas/PNG). O card carrega via fetch no cliente.
- **Rate limiting** — 30 requisições/min por IP via Upstash. Falha aberta se Redis indisponível.
- **Middleware** — Next.js 16 usa convenção `proxy` em vez de `middleware` (aviso ao build, funcional).
- **QR permanente** — o slug nunca muda; apenas o `targetUrl` é editável após criação.
