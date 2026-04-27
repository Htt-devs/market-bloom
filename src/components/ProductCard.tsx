import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  variants: { name: string }[] | null | unknown;
  stock: number | null;
}

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const variants = Array.isArray(product.variants) ? (product.variants as { name: string }[]) : [];

  function handleBuy() {
    if (!user) {
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    navigate({ to: "/checkout/$productId", params: { productId: product.id } });
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-card shadow-card transition-all duration-300 hover:shadow-glow hover:-translate-y-1 border border-border">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-primary opacity-30">
            <ShoppingBag className="h-12 w-12 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          )}
        </div>

        {variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {variants.slice(0, 3).map((v, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {v.name}
              </Badge>
            ))}
            {variants.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{variants.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-xs text-muted-foreground">a partir de</div>
            <div className="font-display text-xl font-bold text-gradient">
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </div>
          </div>
          <Button
            size="sm"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
            onClick={handleBuy}
          >
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
