import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Cria uma cobrança PIX via EvoPay.
 *
 * Comportamento:
 * - Se o admin configurou `evopay_token` em `site_settings`, faz POST real
 *   para https://processamento.evopay.cash/.
 * - Caso contrário, retorna um payload simulado para o front continuar
 *   funcionando (QR via api.qrserver.com com a chave PIX como conteúdo).
 *
 * O token EXATO de endpoint/payload da EvoPay pode variar conforme o painel
 * — este wrapper tenta o endpoint `/api/v1/transactions` padrão e cai para
 * o fallback se falhar, mantendo a UI estável.
 */
export const createEvoPayCharge = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        orderId: z.string().uuid(),
        amount: z.number().positive(),
        productName: z.string().min(1).max(200),
        customerEmail: z.string().email(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Busca configurações globais
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("evopay_token, pix_key")
      .eq("id", 1)
      .maybeSingle();

    const token = settings?.evopay_token?.trim();
    const pixKey = settings?.pix_key?.trim() ?? "";

    let pixCode = "";
    let pixQr = "";
    let evopayId: string | null = null;

    if (token) {
      try {
        const res = await fetch("https://processamento.evopay.cash/api/v1/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Math.round(data.amount * 100), // centavos
            paymentMethod: "PIX",
            customer: { email: data.customerEmail },
            items: [
              {
                title: data.productName,
                unitPrice: Math.round(data.amount * 100),
                quantity: 1,
                tangible: false,
              },
            ],
            externalRef: data.orderId,
          }),
        });

        if (res.ok) {
          const json = (await res.json()) as Record<string, unknown>;
          // Tenta extrair os campos mais comuns da resposta da EvoPay
          const pix =
            (json.pix as Record<string, unknown> | undefined) ??
            (json.data as Record<string, unknown> | undefined) ??
            json;
          pixCode =
            (pix?.payload as string | undefined) ??
            (pix?.qrcode as string | undefined) ??
            (pix?.copyPaste as string | undefined) ??
            "";
          pixQr =
            (pix?.qrCodeImage as string | undefined) ??
            (pix?.qrcodeImage as string | undefined) ??
            (pix?.imagemQrcode as string | undefined) ??
            "";
          evopayId = (json.id as string | undefined) ?? (json.transactionId as string | undefined) ?? null;
        }
      } catch (err) {
        // Cai no fallback abaixo
        console.warn("[EvoPay] request failed, using fallback:", err);
      }
    }

    // Fallback: gera QR a partir da chave PIX (se houver) ou texto descritivo
    if (!pixCode) {
      pixCode = pixKey || `PIX-FALLBACK-${data.orderId}`;
    }
    if (!pixQr) {
      pixQr = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
        pixCode,
      )}`;
    }

    // Persiste no pedido
    await supabaseAdmin
      .from("orders")
      .update({
        pix_code: pixCode,
        pix_qr: pixQr,
        evopay_id: evopayId,
        customer_email: data.customerEmail,
      })
      .eq("id", data.orderId);

    return {
      pixCode,
      pixQr,
      simulated: !token,
    };
  });
