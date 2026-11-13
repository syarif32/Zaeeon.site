
import { createClient } from "@supabase/supabase-js";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function isOrganizationAdmin(
  request: NextRequest
): Promise<boolean> {
  const secret = process.env.NEXTAUTH_SECRET;
  const email = process.env.ADMIN_EMAIL;

  if (!secret || !email) return false;

  const token = await getToken({
    req: request,
    secret,
  });

  return (
    typeof token?.email === "string" &&
    token.email.toLowerCase() === email.toLowerCase()
  );
}

export function organizationAdminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase admin environment is missing");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
