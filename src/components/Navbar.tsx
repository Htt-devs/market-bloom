import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  Settings as SettingsIcon,
  Shield,
  ShoppingCart,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.51 12.51 0 0 0-.617-1.249.077.077 0 0 0-.078-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.105 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.349-1.22.645-1.873.891a.077.077 0 0 0-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.673-3.548-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [discordUrl, setDiscordUrl] = useState("https://discord.gg/");

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("discord_url")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.discord_url) setDiscordUrl(data.discord_url);
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
            <span className="font-display text-lg font-bold text-primary-foreground">Z</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            ZX<span className="text-gradient">MAX</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Discord"
          >
            <DiscordIcon className="h-4 w-4" />
          </a>

          {user ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
                    <Bell className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-display font-semibold">Notificações</h4>
                    <p className="text-sm text-muted-foreground">Você não tem notificações no momento.</p>
                  </div>
                </PopoverContent>
              </Popover>

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => navigate({ to: "/admin" })}
                >
                  <Shield className="mr-1.5 h-4 w-4" />
                  Admin
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Conta">
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard" })}>
                    <UserIcon className="mr-2 h-4 w-4" /> Minha conta
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/catalog" })}>
                    <Package className="mr-2 h-4 w-4" /> Catálogo
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-primary">
                        <Shield className="h-3.5 w-3.5" /> Administração
                      </DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin/products" })}>
                        <Package className="mr-2 h-4 w-4" /> Produtos
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin/orders" })}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Pedidos
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin/users" })}>
                        <Users className="mr-2 h-4 w-4" /> Usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin/notifications" })}>
                        <Bell className="mr-2 h-4 w-4" /> Notificações
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin/support" })}>
                        <LifeBuoy className="mr-2 h-4 w-4" /> Suporte
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate({ to: "/admin/settings" })}>
                        <SettingsIcon className="mr-2 h-4 w-4" /> Configurações
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={async () => {
                      await signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "login" } })}>
                Entrar
              </Button>
              <Button
                size="sm"
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
              >
                Cadastrar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
