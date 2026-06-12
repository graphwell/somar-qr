import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, BarChart3, RefreshCw, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#EF3B2C] flex items-center justify-center">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">Somar QR</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button style={{ backgroundColor: "#EF3B2C" }} className="text-white hover:opacity-90">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 text-center px-4">
          <Badge variant="secondary" className="mb-4">
            QR Codes Dinâmicos Permanentes
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            Altere o destino do seu QR code{" "}
            <span style={{ color: "#EF3B2C" }}>sem reimprimir</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Crie QR codes dinâmicos que duram para sempre. Mude o destino quando quiser,
            acompanhe scans em tempo real e mantenha seus materiais impressos sempre atualizados.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button
                size="lg"
                style={{ backgroundColor: "#EF3B2C" }}
                className="text-white hover:opacity-90 h-12 px-8"
              >
                Criar QR code grátis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Ver demonstração
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 bg-gray-50 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que escolher o Somar QR?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: "#EF3B2C20" }}
                  >
                    <f.icon className="h-6 w-6" style={{ color: "#EF3B2C" }} />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-12">Planos simples e transparentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border p-6 ${plan.highlighted ? "border-[#EF3B2C] shadow-lg" : ""}`}
                >
                  {plan.highlighted && (
                    <Badge className="mb-3" style={{ backgroundColor: "#EF3B2C" }}>
                      Mais popular
                    </Badge>
                  )}
                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-4">
                    {plan.price}
                    {plan.price !== "Grátis" && (
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    )}
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span style={{ color: "#EF3B2C" }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="w-full block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      style={plan.highlighted ? { backgroundColor: "#EF3B2C" } : {}}
                    >
                      Começar agora
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground px-4">
        <p>© {new Date().getFullYear()} Somar QR — qr.somar.ia.br</p>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: RefreshCw,
    title: "Dinâmico e Permanente",
    description: "Altere o destino sem mudar o QR code. Imprima uma vez, use para sempre.",
  },
  {
    icon: BarChart3,
    title: "Analytics Detalhados",
    description: "Veja quantos scans, de qual dispositivo, navegador e localização.",
  },
  {
    icon: QrCode,
    title: "Personalização",
    description: "Escolha cores, adicione logo e customize o visual do seu QR code.",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Infraestrutura robusta com 99.9% de uptime e rate limiting inteligente.",
  },
]

const plans = [
  {
    name: "Grátis",
    price: "Grátis",
    highlighted: false,
    features: ["5 QR codes", "1.000 scans/mês", "Analytics básico", "Suporte por email"],
  },
  {
    name: "Pro",
    price: "R$ 29",
    highlighted: true,
    features: ["50 QR codes", "50.000 scans/mês", "Analytics avançado", "Domínio personalizado", "Suporte prioritário"],
  },
  {
    name: "Enterprise",
    price: "R$ 99",
    highlighted: false,
    features: ["QR codes ilimitados", "Scans ilimitados", "API access", "SLA 99.9%", "Suporte dedicado"],
  },
]
