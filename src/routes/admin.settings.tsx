import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

interface Settings {
  pix_key: string;
  discord_url: string;
  discord_name: string;
  banner_url: string | null;
  logo_url: string | null;
}

function AdminSettings() {
  const [s, setS] = useState<Settings>({
    pix_key: "",
    discord_url: "",
    discord_name: "",
    banner_url: "",
    logo_url: "",
  });
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
          });
        }
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        pix_key: s.pix_key,
        discord_url: s.discord_url,
        discord_name: s.discord_name,
        banner_url: s.banner_url || null,
        logo_url: s.logo_url || null,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Configurações salvas!");
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Pix, Discord e identidade do site.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-gradient-card p-6 shadow-card">
        <div className="space-y-1.5">
          <Label htmlFor="pix">Chave Pix</Label>
          <Input
            id="pix"
            placeholder="email@exemplo.com / CPF / chave aleatória"
            value={s.pix_key}
            onChange={(e) => setS({ ...s, pix_key: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-url">URL do Discord</Label>
            <Input
              id="d-url"
              placeholder="https://discord.gg/..."
              value={s.discord_url}
              onChange={(e) => setS({ ...s, discord_url: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-name">Nome do servidor</Label>
            <Input
              id="d-name"
              value={s.discord_name}
              onChange={(e) => setS({ ...s, discord_name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="banner">URL do banner (opcional)</Label>
          <Input
            id="banner"
            value={s.banner_url ?? ""}
            onChange={(e) => setS({ ...s, banner_url: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="logo">URL do logo (opcional)</Label>
          <Input
            id="logo"
            value={s.logo_url ?? ""}
            onChange={(e) => setS({ ...s, logo_url: e.target.value })}
          />
        </div>

        <Button type="submit" disabled={saving} className="bg-gradient-primary shadow-glow">
          {saving ? "Salvando..." : "Salvar configurações"}
        </Button>
      </form>
    </div>
  );
}
