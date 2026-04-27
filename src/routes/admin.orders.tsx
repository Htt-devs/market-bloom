import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

interface Order {
  id: string;
  user_id: string;
  product_name: string;
  variant: string | null;
  amount: number;
  status: "pending" | "approved" | "rejected" | "delivered";
  created_at: string;
}

const statusMeta = {
  pending: { label: "Aguardando", cls: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Aprovado", cls: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Reprovado", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  delivered: { label: "Entregue", cls: "bg-primary/15 text-primary border-primary/30" },
};

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  async function load() {
    const { data } = await supabase
      .from("orders")
      .select("id, user_id, product_name, variant, amount, status, created_at")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Order["status"]) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Pedido atualizado");
      load();
    }
  }

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Aprove, reprove ou marque como entregue.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "pending", "approved", "delivered", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "Todos" : statusMeta[f].label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/30 p-16 text-center text-muted-foreground">
          Nenhum pedido nesta categoria.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <div
              key={o.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border bg-gradient-card p-4 shadow-card"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{o.product_name}</div>
                {o.variant && <div className="text-xs text-muted-foreground">Variação: {o.variant}</div>}
                <div className="text-xs text-muted-foreground font-mono truncate">
                  Cliente: {o.user_id}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-gradient whitespace-nowrap">
                  R$ {Number(o.amount).toFixed(2).replace(".", ",")}
                </span>
                <Badge variant="outline" className={statusMeta[o.status].cls}>
                  {statusMeta[o.status].label}
                </Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                {o.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(o.id, "approved")}
                      className="bg-success/20 text-success hover:bg-success/30 border border-success/30"
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(o.id, "rejected")}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <X className="mr-1 h-3.5 w-3.5" /> Reprovar
                    </Button>
                  </>
                )}
                {o.status === "approved" && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(o.id, "delivered")}
                    className="bg-gradient-primary shadow-glow"
                  >
                    <Truck className="mr-1 h-3.5 w-3.5" /> Marcar entregue
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
