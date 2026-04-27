import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DollarSign, Clock, CheckCircle2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    pending: 0,
    approved: 0,
    users: 0,
    revenue: 0,
  });

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("amount, status", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]).then(([ordersRes, profilesRes]) => {
      const orders = (ordersRes.data ?? []) as { amount: number; status: string }[];
      const approved = orders.filter((o) => o.status === "approved" || o.status === "delivered");
      const pending = orders.filter((o) => o.status === "pending");
      const revenue = approved.reduce((s, o) => s + Number(o.amount), 0);
      setStats({
        totalSales: approved.length,
        pending: pending.length,
        approved: approved.length,
        users: profilesRes.count ?? 0,
        revenue,
      });
    });
  }, []);

  const cards = [
    {
      label: "Receita aprovada",
      value: `R$ ${stats.revenue.toFixed(2).replace(".", ",")}`,
      icon: DollarSign,
      tint: "text-success bg-success/10",
    },
    {
      label: "Vendas concluídas",
      value: stats.totalSales,
      icon: CheckCircle2,
      tint: "text-primary bg-primary/10",
    },
    {
      label: "Pedidos pendentes",
      value: stats.pending,
      icon: Clock,
      tint: "text-warning bg-warning/10",
    },
    {
      label: "Usuários cadastrados",
      value: stats.users,
      icon: Users,
      tint: "text-foreground bg-secondary",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do seu marketplace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-border bg-gradient-card p-5 shadow-card">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.tint}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
              <div className="mt-1 font-display text-2xl font-bold">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-gradient-card p-6 shadow-card">
        <h2 className="font-display text-lg font-bold mb-2">Próximos passos</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Configure sua chave Pix em <strong>Configurações</strong>.</li>
          <li>• Cadastre seus produtos em <strong>Produtos</strong>.</li>
          <li>• Aprove pedidos recebidos em <strong>Pedidos</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
