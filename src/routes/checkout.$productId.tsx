import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Copy, CheckCircle2, Mail, QrCode, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createEvoPayCharge } from "@/lib/evopay.functions";

export const Route = createFileRoute("/checkout/$productId")({
  component: CheckoutPage,
});

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  variants: { name: string }[] | null | unknown;
}

type Step = "email" | "pix" | "done";

function CheckoutPage() {
  const { productId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const createCharge = useServerFn(createEvoPayCharge);

  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<string>("");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pix, setPix] = useState<{ code: string; qr: string; simulated: boolean } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
    if (user?.email) setEmail(user.email);
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, description, price, image_url, variants, category")
      .eq("id", productId)
      .maybeSingle()
      .then(({ data }) => setProduct(data as Product | null));
  }, [productId]);

  const variants =
    product && Array.isArray(product.variants) ? (product.variants as { name: string }[]) : [];

  async function handleConfirmEmail() {
    if (!user || !product) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Informe um e-mail válido");
      return;
    }
    setLoading(true);
    try {
      // 1) Cria o pedido pendente
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          variant: variant || (variants[0]?.name ?? null),
          amount: product.price,
          customer_email: email,
        })
        .select("id")
        .single();
      if (error) throw error;

      // 2) Gera cobrança PIX via EvoPay (server fn)
      const charge = await createCharge({
        data: {
          orderId: order.id,
          amount: Number(product.price),
          productName: product.name,
          customerEmail: email,
        },
      });

      setOrderId(order.id);
      setPix({ code: charge.pixCode, qr: charge.pixQr, simulated: charge.simulated });
      setStep("pix");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao iniciar pagamento");
    } finally {
      setLoading(false);
    }
  }

  function copyPix() {
    if (!pix?.code) return;
    navigator.clipboard.writeText(pix.code);
    toast.success("Código PIX copiado!");
  }

  function confirmPaid() {
    setStep("done");
    toast.success("Pedido enviado para aprovação!");
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          Carregando produto...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao catálogo
        </Link>

        {/* Stepper */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          <StepDot label="E-mail" active={step === "email"} done={step !== "email"} idx={1} />
          <div className="h-px flex-1 bg-white/10" />
          <StepDot label="PIX" active={step === "pix"} done={step === "done"} idx={2} />
          <div className="h-px flex-1 bg-white/10" />
          <StepDot label="Confirmado" active={step === "done"} done={step === "done"} idx={3} />
        </div>

        {/* Product summary */}
        <div className="rounded-3xl glass-card border border-white/10 p-5 mb-4">
          <div className="flex items-center gap-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-primary/30" />
            )}
            <div className="flex-1 min-w-0">
              {product.category && (
                <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                  {product.category}
                </span>
              )}
              <h1 className="font-display text-lg font-bold truncate">{product.name}</h1>
              <div className="text-xl font-extrabold italic text-gradient-strong">
                R$ {Number(product.price).toFixed(2).replace(".", ",")}
              </div>
            </div>
          </div>

          {variants.length > 0 && step === "email" && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                Escolha a variação:
              </div>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setVariant(v.name)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      variant === v.name
                        ? "bg-gradient-primary text-primary-foreground shadow-indigo"
                        : "glass-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <div className="rounded-3xl glass-card border border-white/10 p-6 shadow-elegant">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">Identificação</h2>
                <p className="text-xs text-muted-foreground">Enviaremos a entrega para este e-mail</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail de entrega</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="rounded-xl h-11"
              />
            </div>

            <Button
              onClick={handleConfirmEmail}
              disabled={loading}
              className="w-full mt-5 h-12 rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-semibold gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando PIX...
                </>
              ) : (
                <>
                  Gerar PIX <QrCode className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: PIX */}
        {step === "pix" && pix && (
          <div className="rounded-3xl glass-card border border-white/10 p-6 shadow-elegant">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">Pagamento via PIX</h2>
                  <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
                </div>
              </div>
              <Badge className="bg-success/15 text-success border-success/30 rounded-full">
                Instantâneo
              </Badge>
            </div>

            {pix.simulated && (
              <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
                ⚠️ Token EvoPay não configurado. QR gerado em modo demonstração.
              </div>
            )}

            {/* QR Code container — fundo branco com sombra suave */}
            <div className="mx-auto w-fit rounded-3xl bg-white p-4 shadow-elegant">
              <img
                src={pix.qr}
                alt="QR Code PIX"
                className="h-64 w-64 block"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            <div className="mt-5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                PIX Copia e Cola
              </Label>
              <div className="mt-1.5 flex gap-2">
                <code className="flex-1 rounded-xl bg-background border border-white/10 px-3 py-2.5 text-xs break-all max-h-24 overflow-auto">
                  {pix.code}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyPix}
                  aria-label="Copiar"
                  className="rounded-xl h-auto border-white/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={confirmPaid}
              className="w-full mt-5 h-12 rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-semibold gap-2"
            >
              <ShieldCheck className="h-4 w-4" /> Já paguei
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Após o pagamento, a entrega é liberada automaticamente.
            </p>
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="rounded-3xl glass-card border border-white/10 p-8 text-center shadow-elegant">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 ring-glow">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-display text-2xl font-extrabold italic">Pedido enviado!</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Assim que o pagamento for confirmado, sua entrega aparece no painel
              <span className="text-foreground"> Minha conta</span>.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                className="rounded-2xl h-11 bg-gradient-primary shadow-glow font-semibold"
              >
                Ver meus pedidos
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: "/catalog" })}
                className="rounded-2xl h-11"
              >
                Continuar comprando
              </Button>
            </div>
            {orderId && (
              <p className="mt-4 text-[10px] text-muted-foreground font-mono">#{orderId.slice(0, 8)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({
  idx,
  label,
  active,
  done,
}: {
  idx: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
          done
            ? "bg-success text-success-foreground"
            : active
            ? "bg-gradient-primary text-primary-foreground shadow-indigo"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx}
      </div>
      <span
        className={`text-[11px] font-semibold ${
          active || done ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
