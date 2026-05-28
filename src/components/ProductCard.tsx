import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Zap, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  variants: { name: string }[] | null | unknown;
  stock: number | null;
  category?: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const category = product.category || "Digital";

  function handleBuy() {
    if (!user) {
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    navigate({ to: "/checkout/$productId", params: { productId: product.id } });
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl glass-card transition-all duration-500 hover:scale-[1.02] hover:ring-glow">
      {/* Glow border on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.585 0.233 277 / 0.15), transparent 40%, oklch(0.68 0.21 305 / 0.12))",
        }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-primary opacity-40">
            <ShoppingBag className="h-12 w-12 text-primary-foreground" />
          </div>
        )}
        {/* Dark fade at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />

        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/30">
            {category}
          </span>
        </div>

        {/* Auto delivery badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/20 backdrop-blur px-2 py-1 text-[10px] font-semibold text-success border border-success/30">
            <Zap className="h-2.5 w-2.5 fill-success" />
            Auto
          </span>
        </div>
      </div>

      <div className="relative p-5 space-y-3">
        <h3 className="font-display text-base font-bold leading-tight line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-end justify-between pt-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">a partir de</div>
            <div className="font-display text-2xl font-extrabold italic text-gradient-strong">
              R${" "}
              {Number(product.price)
                .toFixed(2)
                .replace(".", ",")}
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleBuy}
            className="rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-indigo gap-1.5 font-semibold"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
