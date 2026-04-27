import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, Zap, ShieldCheck, ArrowRight } from "lucide-react";
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
        <div className="container relative mx-auto px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Marketplace digital com entrega por chat
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold tracking-tight">
            Tudo que você precisa,<br />
            <span className="text-gradient">em um só lugar.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base md:text-lg text-muted-foreground">
            Compre produtos digitais com Pix, receba entrega manual por chat e tenha suporte direto com a nossa equipe.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleEnter}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
            >
              {user ? "Ver catálogo" : "Entrar para ver o catálogo"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
              >
                Criar conta
              </Button>
            )}
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Zap, label: "Pix instantâneo" },
              { icon: ShieldCheck, label: "Aprovação manual" },
              { icon: Sparkles, label: "Entrega por chat" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm backdrop-blur"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ZXMAX. Todos os direitos reservados.
      </footer>
    </div>
  );
}
