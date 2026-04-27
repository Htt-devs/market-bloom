import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/checkout/$productId")({
  component: CheckoutPage,
});

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  variants: { name: string }[] | null | unknown;
}

function CheckoutPage() {
  const { productId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [pixKey, setPixKey] = useState("");
  const [variant, setVariant] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, description, price, image_url, variants")
      .eq("id", productId)
      .maybeSingle()
      .then(({ data }) => setProduct(data as Product | null));

    supabase
      .from("site_settings")
      .select("pix_key")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => setPixKey(data?.pix_key ?? ""));
  }, [productId]);

  const variants = product && Array.isArray(product.variants) ? (product.variants as { name: string }[]) : [];

  async function handleConfirm() {
    if (!user || !product) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          variant: variant || (variants[0]?.name ?? null),
          amount: product.price,
          pix_key: pixKey,
        })
        .select("id")
        .single();
      if (error) throw error;
      setOrderId(data.id);
      toast.success("Pedido criado! Aguardando aprovação.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar pedido");
    } finally {
      setSubmitting(false);
    }
  }

  function copyPix() {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    toast.success("Chave Pix copiada!");
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Carregando produto...</div>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 py-12">
          <div className="rounded-2xl border border-border bg-gradient-card p-8 text-center shadow-elegant">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold">Pedido enviado!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Assim que confirmarmos seu pagamento, o pedido será aprovado e você poderá abrir o chat de entrega.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild className="bg-gradient-primary shadow-glow">
                <Link to="/dashboard">Ver meus pedidos</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/">Continuar comprando</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao catálogo
        </Link>

        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-elegant">
          <div className="flex items-center gap-4">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gradient-primary/30" />
            )}
            <div>
              <h1 className="font-display text-xl font-bold">{product.name}</h1>
              <div className="text-2xl font-bold text-gradient">
                R$ {Number(product.price).toFixed(2).replace(".", ",")}
              </div>
            </div>
          </div>

          {variants.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Escolha a variação:</div>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setVariant(v.name)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      variant === v.name
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold">Pagamento via Pix</h2>
              <Badge className="bg-success/15 text-success border-success/30">Instantâneo</Badge>
            </div>
            {pixKey ? (
              <>
                <div className="text-xs text-muted-foreground mb-1">Chave Pix:</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-background border border-border px-3 py-2 text-sm break-all">
                    {pixKey}
                  </code>
                  <Button size="icon" variant="outline" onClick={copyPix} aria-label="Copiar">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Faça o Pix e clique em <strong>Confirmar pedido</strong>. Aprovaremos manualmente assim que o pagamento for identificado.
                </p>
              </>
            ) : (
              <p className="text-sm text-warning">
                Chave Pix ainda não configurada pelo administrador.
              </p>
            )}
          </div>

          <Button
            onClick={handleConfirm}
            disabled={submitting || !pixKey}
            className="w-full mt-6 bg-gradient-primary text-primary-foreground shadow-glow"
          >
            {submitting ? "Enviando..." : "Confirmar pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
