import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, Zap, ShieldCheck, ArrowRight, Headphones } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleEnter() {
    if (user) {
      navigate({ to: "/catalog" });
    } else {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 30%, transparent 70%)",
          }}
        />

        <div className="container relative mx-auto px-4 py-24 md:py-40 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 glass px-3.5 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Loja digital premium · Entrega automática
          </div>

          <h1 className="mt-7 font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
            <span className="italic">Tudo que você</span>
            <br />
            <span className="text-gradient-strong italic">precisa, em segundos.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Compre produtos digitais com <strong className="text-foreground">PIX instantâneo</strong>,
            receba na hora e tenha suporte direto 24/7 no nosso Discord.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleEnter}
              className="rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-7 text-base font-semibold gap-2"
            >
              {user ? "Ver catálogo" : "Acessar a loja"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
                className="rounded-2xl h-12 px-7 border-white/10 glass-card hover:bg-white/5"
              >
                Criar conta grátis
              </Button>
            )}
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Zap, label: "PIX instantâneo", desc: "Pagamento em segundos" },
              { icon: ShieldCheck, label: "Entrega automática", desc: "Disponível 24/7" },
              { icon: Headphones, label: "Suporte Discord", desc: "Resposta rápida" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group flex items-center gap-3 rounded-2xl glass-card px-4 py-3.5 text-left transition-all hover:scale-[1.02] hover:ring-glow"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary/25 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-[11px] text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} <span className="italic text-gradient">System Shop</span>. Todos os direitos reservados.
      </footer>
    </div>
  );
}
