
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bell_text text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS evopay_token text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_name text DEFAULT 'System Shop';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_qr text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS evopay_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;

INSERT INTO public.site_settings (id, brand_name, bell_text)
VALUES (1, 'System Shop', 'Bem-vindo à System Shop! Entregas automáticas e suporte 24/7.')
ON CONFLICT (id) DO UPDATE SET
  brand_name = COALESCE(public.site_settings.brand_name, 'System Shop');
