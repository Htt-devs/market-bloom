import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings as SettingsIcon,
  Bell,
  LifeBuoy,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const menu = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Produtos", icon: Package },
  { to: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/notifications", label: "Notificações", icon: Bell },
  { to: "/admin/support", label: "Suporte", icon: LifeBuoy },
  { to: "/admin/settings", label: "Configurações", icon: SettingsIcon },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Verificando acesso...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <span className="font-display font-bold text-primary-foreground">Z</span>
          </div>
          <div>
            <div className="font-display font-bold leading-none">ZXMAX</div>
            <div className="text-xs text-muted-foreground">Admin</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = m.exact ? location.pathname === m.to : location.pathname.startsWith(m.to);
            return (
              <Link
                key={m.to}
                to={m.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 glass border-b border-border h-14 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
            <span className="font-display text-xs font-bold text-primary-foreground">Z</span>
          </div>
          <span className="font-display font-bold text-sm">ZXMAX Admin</span>
        </Link>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className="text-sm text-muted-foreground"
        >
          Sair
        </button>
      </div>

      <main className="flex-1 md:pt-0 pt-14 overflow-x-hidden">
        {/* Mobile menu */}
        <div className="md:hidden flex gap-1 overflow-x-auto p-3 border-b border-border bg-card/40">
          {menu.map((m) => {
            const active = m.exact ? location.pathname === m.to : location.pathname.startsWith(m.to);
            return (
              <Link
                key={m.to}
                to={m.to}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-secondary"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </div>

        <Outlet />
      </main>
    </div>
  );
}
