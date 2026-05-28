import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catálogo — System Shop" },
      { name: "description", content: "Explore o catálogo de produtos digitais System Shop." },
      { property: "og:title", content: "Catálogo — System Shop" },
      { property: "og:description", content: "Produtos digitais com PIX instantâneo e entrega automática." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("Todos");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("products")
      .select("id, name, description, price, image_url, variants, stock, category")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["Todos", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCat === "Todos" || p.category === activeCat;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, search, activeCat]);

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

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none opacity-60" />
        <div className="container relative mx-auto px-4 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 glass px-3 py-1 text-xs text-muted-foreground">
            <ShoppingBag className="h-3 w-3 text-primary" />
            Catálogo System Shop
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="italic">Produtos </span>
            <span className="text-gradient-strong italic">disponíveis</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm md:text-base text-muted-foreground">
            Escolha, pague via PIX e receba a entrega na hora.
          </p>

          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="pl-10 rounded-2xl h-11 glass-card border-white/10"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 pb-24">
        {categories.length > 1 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeCat === c
                    ? "bg-gradient-primary text-primary-foreground shadow-indigo"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-card/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 glass-card p-16 text-center">
            <p className="text-muted-foreground">
              {products.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum produto encontrado."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} <span className="italic text-gradient">System Shop</span>. Todos os direitos reservados.
      </footer>
    </div>
  );
}
