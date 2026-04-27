import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  variants: { name: string }[] | null | unknown;
  stock: number | null;
  active: boolean;
}

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  variantsText: string;
  stock: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  variantsText: "",
  stock: "",
  active: true,
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Product) {
    const variants = Array.isArray(p.variants) ? (p.variants as { name: string }[]) : [];
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      image_url: p.image_url ?? "",
      variantsText: variants.map((v) => v.name).join(", "),
      stock: p.stock != null ? String(p.stock) : "",
      active: p.active,
    });
    setOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: pub.publicUrl }));
      toast.success("Imagem enviada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const variants = form.variantsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        image_url: form.image_url || null,
        variants,
        stock: form.stock ? Number(form.stock) : null,
        active: form.active,
      };

      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Produto criado!");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Produto excluído");
      load();
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">Gerencie seu catálogo.</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-primary shadow-glow">
          <Plus className="mr-1.5 h-4 w-4" /> Novo produto
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/30 p-16 text-center">
          <p className="text-muted-foreground">Nenhum produto ainda. Clique em <strong>Novo produto</strong>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-gradient-card overflow-hidden shadow-card">
              <div className="aspect-video bg-muted overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-primary/20" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold line-clamp-1">{p.name}</h3>
                  <span
                    className={`text-[10px] uppercase rounded px-1.5 py-0.5 ${
                      p.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gradient font-bold">
                  R$ {Number(p.price).toFixed(2).replace(".", ",")}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1">
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Imagem</Label>
              {form.image_url ? (
                <div className="relative">
                  <img src={form.image_url} alt="" className="w-full h-40 rounded-lg object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-card/40 hover:bg-card/60 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {uploading ? "Enviando..." : "Clique para enviar (galeria)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                    }}
                  />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-name">Nome *</Label>
              <Input
                id="p-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Descrição</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Preço (R$) *</Label>
                <Input
                  id="p-price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-stock">Estoque (opcional)</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-vars">Variações (separadas por vírgula)</Label>
              <Input
                id="p-vars"
                placeholder="Ex: Pequeno, Médio, Grande"
                value={form.variantsText}
                onChange={(e) => setForm((f) => ({ ...f, variantsText: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="p-active" className="cursor-pointer">Produto ativo</Label>
              <Switch
                id="p-active"
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-gradient-primary shadow-glow">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
