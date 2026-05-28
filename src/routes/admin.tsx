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
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Verificando acesso...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-sidebar">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-primary shadow-indigo">
            <span className="font-display font-bold text-primary-foreground italic">S</span>
          </div>
          <div>
            <div className="font-display font-bold leading-none italic">System Shop</div>
            <div className="text-[10px] uppercase tracking-wider text-primary mt-0.5">Admin</div>
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
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary shadow-indigo"
                    : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 glass border-b border-white/5 h-14 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-primary">
            <span className="font-display text-xs font-bold text-primary-foreground italic">S</span>
          </div>
          <span className="font-display font-bold text-sm italic">System Shop Admin</span>
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
        <div className="md:hidden flex gap-1 overflow-x-auto p-3 border-b border-white/5 bg-card/40">
          {menu.map((m) => {
            const active = m.exact ? location.pathname === m.to : location.pathname.startsWith(m.to);
            return (
              <Link
                key={m.to}
                to={m.to}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-indigo"
                    : "text-muted-foreground bg-secondary"
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
