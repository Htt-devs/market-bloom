import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/admin/support")({
  component: () => (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Suporte</h1>
        <p className="text-sm text-muted-foreground">Tickets e chats de entrega.</p>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card/30 p-16 text-center">
        <LifeBuoy className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          O sistema de chat interno (admin ↔ cliente) será habilitado na Fase 2.
        </p>
      </div>
    </div>
  ),
});
