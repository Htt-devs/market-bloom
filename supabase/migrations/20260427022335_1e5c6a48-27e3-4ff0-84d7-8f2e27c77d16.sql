
-- Revogar EXECUTE público em funções SECURITY DEFINER que só são chamadas internamente
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;

-- has_role precisa ser chamável por authenticated (usada em policies via auth.uid())
-- Mas policies invocam funções com privilégios do owner, não do caller — podemos revogar de anon
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, public;
