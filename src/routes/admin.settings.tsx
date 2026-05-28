import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Bell, KeyRound, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

interface Settings {
  pix_key: string;
  discord_url: string;
  discord_name: string;
  banner_url: string | null;
  logo_url: string | null;
  bell_text: string;
  evopay_token: string;
  brand_name: string;
}

const empty: Settings = {
  pix_key: "",
  discord_url: "",
  discord_name: "",
  banner_url: "",
  logo_url: "",
  bell_text: "",
  evopay_token: "",
  brand_name: "System Shop",
};

function AdminSettings() {
  const [s, setS] = useState<Settings>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setS({
            pix_key: data.pix_key ?? "",
            discord_url: data.discord_url ?? "",
            discord_name: data.discord_name ?? "",
            banner_url: data.banner_url ?? "",
            logo_url: data.logo_url ?? "",
            bell_text: data.bell_text ?? "",
            evopay_token: data.evopay_token ?? "",
            brand_name: data.brand_name ?? "System Shop",
          });
        }
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        id: 1,
        pix_key: s.pix_key,
        discord_url: s.discord_url,
        discord_name: s.discord_name,
        banner_url: s.banner_url || null,
        logo_url: s.logo_url || null,
        bell_text: s.bell_text,
        evopay_token: s.evopay_token,
        brand_name: s.brand_name,
      });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Configurações salvas!");
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold italic">Configurações</h1>
        <p className="text-sm text-muted-foreground">EvoPay, sininho, Discord e identidade da loja.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* EvoPay */}
        <Section
          icon={KeyRound}
          title="EvoPay (Gateway PIX)"
          desc="Cole o token da sua conta EvoPay para gerar PIX automaticamente."
        >
          <div className="space-y-1.5">
            <Label htmlFor="evopay">Token EvoPay</Label>
            <Input
              id="evopay"
              type="password"
              placeholder="sk_live_..."
              value={s.evopay_token}
              onChange={(e) => setS({ ...s, evopay_token: e.target.value })}
              className="rounded-xl font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Sem token, o checkout exibe um QR de demonstração usando a chave PIX abaixo.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pix">Chave PIX (fallback)</Label>
            <Input
              id="pix"
              placeholder="email / CPF / chave aleatória"
              value={s.pix_key}
              onChange={(e) => setS({ ...s, pix_key: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </Section>

        {/* Sininho */}
        <Section
          icon={Bell}
          title="Aviso do Sininho"
          desc="Texto exibido para todos os usuários no ícone de notificação."
        >
          <div className="space-y-1.5">
            <Label htmlFor="bell">Mensagem global</Label>
            <Textarea
              id="bell"
              rows={3}
              value={s.bell_text}
              onChange={(e) => setS({ ...s, bell_text: e.target.value })}
              placeholder="Ex: 🎉 Promoção de fim de semana — 20% OFF em tudo!"
              className="rounded-xl"
            />
          </div>
        </Section>

        {/* Identidade */}
        <Section
          icon={Sparkles}
          title="Identidade da loja"
          desc="Nome exibido no header e nas metatags."
        >
          <div className="space-y-1.5">
            <Label htmlFor="brand">Nome da loja</Label>
            <Input
              id="brand"
              value={s.brand_name}
              onChange={(e) => setS({ ...s, brand_name: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="banner">URL do banner (opcional)</Label>
              <Input
                id="banner"
                value={s.banner_url ?? ""}
                onChange={(e) => setS({ ...s, banner_url: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logo">URL do logo (opcional)</Label>
              <Input
                id="logo"
                value={s.logo_url ?? ""}
                onChange={(e) => setS({ ...s, logo_url: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </Section>

        {/* Discord */}
        <Section
          icon={MessageCircle}
          title="Discord"
          desc="Link e nome do servidor exibidos no header."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="d-url">URL do Discord</Label>
              <Input
                id="d-url"
                placeholder="https://discord.gg/..."
                value={s.discord_url}
                onChange={(e) => setS({ ...s, discord_url: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Nome do servidor</Label>
              <Input
                id="d-name"
                value={s.discord_name}
                onChange={(e) => setS({ ...s, discord_name: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </Section>

        <Button
          type="submit"
          disabled={saving}
          className="rounded-2xl h-11 px-6 bg-gradient-primary shadow-glow font-semibold"
        >
          {saving ? "Salvando..." : "Salvar configurações"}
        </Button>
      </form>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="space-y-4 pl-1">{children}</div>
    </div>
  );
}
