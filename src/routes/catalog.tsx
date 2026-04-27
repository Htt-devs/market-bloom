import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { ProductCard, type Product } from "@/components/ProductCard";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catálogo — ZXMAX" },
      { name: "description", content: "Explore o catálogo completo de produtos digitais ZXMAX." },
      { property: "og:title", content: "Catálogo — ZXMAX" },
      { property: "og:description", content: "Explore o catálogo completo de produtos digitais ZXMAX." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("products")
      .select("id, name, description, price, image_url, variants, stock")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="border-b border-border bg-gradient-hero/40">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <ShoppingBag className="h-3 w-3 text-primary" />
            Catálogo ZXMAX
          </div>
          <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-tight">
            Produtos <span className="text-gradient">disponíveis</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm md:text-base text-muted-foreground">
            Escolha um produto, pague via Pix e receba a entrega direto pelo chat.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-card/50" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-16 text-center">
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
            <p className="mt-1 text-xs text-muted-foreground">Volte em breve, novos produtos chegando!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ZXMAX. Todos os direitos reservados.
      </footer>
    </div>
  );
}
