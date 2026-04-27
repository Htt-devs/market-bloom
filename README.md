# ZXMAX — Marketplace digital

Marketplace de produtos digitais com checkout via Pix, painel admin e entregas manuais.

## Stack
- React 19 + TanStack Router
- Vite 7 + TailwindCSS v4
- Lovable Cloud (Supabase: PostgreSQL + Auth + Storage)

## Deploy no Render (Static Site) — passo a passo

### 1. Subir o código no GitHub
```bash
git init
git add .
git commit -m "ZXMAX initial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/zxmax.git
git push -u origin main
```

### 2. Criar o Static Site no Render
1. Acesse https://dashboard.render.com → **New +** → **Static Site**
2. Conecte o repositório do GitHub
3. Configure:
   - **Build Command:** `npm install && npm run build:render`
   - **Publish Directory:** `dist-spa`

### 3. Adicionar variáveis de ambiente
Em **Environment** no painel do Render, adicione:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://mzzkwsqofgsqrdyujael.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (chave anon — ver `.env.example`) |
| `VITE_SUPABASE_PROJECT_ID` | `mzzkwsqofgsqrdyujael` |

> Os valores estão no arquivo `.env.example` deste repo.

### 4. (Opcional) Usar o `render.yaml`
Já existe um `render.yaml` na raiz. Se preferir Blueprint:
1. **New +** → **Blueprint** → conecte o repo.
2. O Render detecta o `render.yaml` automaticamente. Você só precisa preencher os 3 valores das envs.

### 5. SPA fallback
O arquivo `public/_redirects` já está configurado com `/* /index.html 200` para que rotas como `/dashboard`, `/admin`, `/auth`, etc. funcionem ao serem acessadas direto ou recarregadas (F5).

## Rodar localmente
```bash
npm install
cp .env.example .env
npm run dev          # preview SSR (mesmo da Lovable)
npm run build:render # gera ./dist-spa para deploy
```

## Acesso admin
Cadastre-se com o e-mail **`admin@keybot.com`** e a role `admin` é atribuída automaticamente via trigger no Supabase. O botão **Admin** aparece na navbar.

## Estrutura
```
src/
  routes/                # rotas TanStack (file-based)
    index.tsx            # home + catálogo
    auth.tsx             # login/cadastro
    dashboard.tsx        # área do cliente
    checkout.$productId.tsx
    admin.tsx            # layout admin (sidebar)
    admin.index.tsx      # dashboard admin
    admin.products.tsx   # CRUD produtos
    admin.orders.tsx     # aprovação de pedidos
    admin.settings.tsx   # Pix, Discord, etc.
    admin.users.tsx
    admin.notifications.tsx
    admin.support.tsx
  components/            # Navbar, ProductCard, ui/*
  hooks/useAuth.tsx      # AuthProvider + useAuth
  integrations/supabase/ # cliente
  styles.css             # design system (dark premium)
```

## Banco de dados
Schema já criado no Supabase com:
- `profiles` (auto-criado no signup via trigger)
- `user_roles` (admin / user — separado por segurança)
- `products` (com variants em JSONB e upload de imagem no bucket `product-images`)
- `orders` (status: pending / approved / rejected / delivered)
- `site_settings` (chave Pix, Discord, banner, logo)

Todas as tabelas têm RLS habilitado.
