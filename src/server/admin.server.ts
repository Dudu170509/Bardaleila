// Server-only helpers — never import from client code.
import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend não configurado.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD não configurada.");
  if (input !== expected) throw new Error("Senha incorreta.");
}
