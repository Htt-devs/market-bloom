import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Receipt, User as UserIcon, MessageSquare, Bell } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

interface Order {
  id: string;
  product_name: string;
  variant: string | null;
  amount: number;
  status: "pending" | "approved" | "rejected" | "delivered";
  created_at: string;
}

const statusMeta: Record<Order["status"], { label: string; cls: string }> = {
  pending: { label: "Aguardando aprovação", cls: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Aprovado", cls: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Reprovado", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  delivered: { label: "Entregue", cls: "bg-primary/15 text-primary border-primary/30" },
};

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"orders" | "products" | "support" | "profile" | "notifications">("orders");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "login" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, product_name, variant, amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const tabs = [
    { id: "orders" as const, label: "Histórico", icon: Receipt },
    { id: "products" as const, label: "Produtos", icon: Package },
    { id: "support" as const, label: "Suporte", icon: MessageSquare },
    { id: "notifications" as const, label: "Notificações", icon: Bell },
    { id: "profile" as const, label: "Perfil", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Minha conta</h1>
          <p className="text-sm text-muted-foreground">Olá, {user.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <nav className="rounded-xl border border-border bg-card/40 p-2 h-max">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card min-h-[400px]">
            {tab === "orders" && (
              <div>
                <h2 className="font-display text-xl font-bold mb-4">Histórico de compras</h2>
                {orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-12 text-center">
                    <Receipt className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Você ainda não fez nenhuma compra.</p>
                    <Button asChild className="mt-4 bg-gradient-primary shadow-glow">
                      <Link to="/">Ver catálogo</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-4"
                      >
                        <div>
                          <div className="font-semibold">{o.product_name}</div>
                          {o.variant && (
                            <div className="text-xs text-muted-foreground">Variação: {o.variant}</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display font-bold text-gradient">
                            R$ {Number(o.amount).toFixed(2).replace(".", ",")}
                          </span>
                          <Badge variant="outline" className={statusMeta[o.status].cls}>
                            {statusMeta[o.status].label}
                          </Badge>
                          {(o.status === "approved" || o.status === "delivered") && (
                            <Button size="sm" variant="outline" disabled>
                              Ver produto
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "products" && (
              <EmptyTab
                icon={Package}
                title="Produtos disponíveis"
                description="Veja todos os produtos do catálogo."
                cta={{ label: "Ir para o catálogo", to: "/" }}
              />
            )}
            {tab === "support" && (
              <EmptyTab
                icon={MessageSquare}
                title="Suporte"
                description="O sistema de tickets será habilitado em breve. Por enquanto, fale com a gente pelo Discord."
              />
            )}
            {tab === "notifications" && (
              <EmptyTab
                icon={Bell}
                title="Notificações"
                description="Você não tem notificações novas."
              />
            )}
            {tab === "profile" && (
              <div>
                <h2 className="font-display text-xl font-bold mb-4">Perfil</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">E-mail</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ID</div>
                    <div className="font-mono text-xs">{user.id}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyTab({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  cta?: { label: string; to: string };
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">{title}</h2>
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <Icon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">{description}</p>
        {cta && (
          <Button asChild className="mt-4 bg-gradient-primary shadow-glow">
            <Link to={cta.to}>{cta.label}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
