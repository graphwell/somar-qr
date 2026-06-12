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
| Banco         | PostgreSQL 16                      |
| Auth          | NextAuth v4 (JWT + Credentials)    |
| Cache         | Redis 7 (IORedis) + rate limiting  |
| Deploy        | Docker Compose + Nginx             |
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
    qr/[id]/image/         # Download PNG do QR code
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
  prisma.ts    # PrismaClient com @prisma/adapter-pg
  redis.ts     # IORedis + rateLimit helper
  auth.ts      # NextAuthOptions (JWT + Credentials)
  qr.ts        # Geração de QR codes (qrcode lib)
  analytics.ts # Tracking de scans via ua-parser-js
  email.ts     # Envio de emails via nodemailer
  utils.ts     # cn, formatDate, formatNumber, slugify

actions/
  auth.ts  # registerUser
  qr.ts    # CRUD + toggle de QR codes

prisma/schema.prisma  # Modelos: User, QRCode, QRAnalytics, Subscription, AuditLog
middleware.ts         # Proteção de rotas /dashboard, /qr, /admin
```

## Modelos Prisma

- **User** — autenticação, role (USER/ADMIN)
- **Account/Session/VerificationToken** — NextAuth adapter
- **QRCode** — slug único, targetUrl, cor, isActive, totalScans
- **QRAnalytics** — browser, OS, device, IP por scan
- **Subscription** — plano (FREE/PRO/ENTERPRISE), limites
- **AuditLog** — log de ações
- **SystemSettings** — configurações key/value

## Variáveis de ambiente (.env)

```env
DATABASE_URL=postgresql://somar:somarqr123@localhost:5432/somarqr
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://qr.somar.ia.br
NEXT_PUBLIC_BASE_URL=https://qr.somar.ia.br
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@gmail.com
SMTP_PASS=sua-senha-de-app
```

## Dev local

```bash
# Sobe DB + Redis
docker compose up postgres redis -d

# Migrations
npx prisma migrate dev

# App
npm run dev
```

## Deploy produção

```bash
# Na VPS:
git clone https://github.com/somarsolucoessuporte-netizen/somar-qr.git
cd somar-qr
cp .env .env.prod  # edite com secrets reais
bash scripts/deploy.sh
```

## Notas importantes

- **Shadcn v4 usa Base UI** — não suporta `asChild` prop. Use estado controlado para triggers de Dialog/Dropdown.
- **Prisma 7** — requer `@prisma/adapter-pg`. URL é passada via `PrismaPg({ connectionString })`.
- **Middleware** — Next.js 16 usa convenção `proxy` em vez de `middleware` (aviso ao build, funcional).
- **Rate limiting** — 30 scans/min por IP via Redis. Se Redis cair, falha aberta (permite o scan).
- **QR permanente** — o slug nunca muda; apenas o `targetUrl` é editável após criação.
