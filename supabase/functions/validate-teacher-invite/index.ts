
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hashVerificationCode(code: string): Promise<string> {
  const normalizedCode = code.trim().toUpperCase();
  const bytes = new TextEncoder().encode(normalizedCode);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const jsonResponse = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const { teacherId, verificationCode } = await req.json();

    if (
      typeof teacherId !== "string" ||
      typeof verificationCode !== "string" ||
      !teacherId.trim() ||
      !verificationCode.trim()
    ) {
      return jsonResponse(
        { error: "Enter your school-issued teacher ID and verification code." },
        400,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Required Supabase environment variables are missing.");
      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const normalizedTeacherId = teacherId.trim().toUpperCase();
    const verificationCodeHash = await hashVerificationCode(verificationCode);

    const { data: invitation, error } = await adminClient
      .from("teacher_invites")
      .select("teacher_id")
      .eq("teacher_id", normalizedTeacherId)
      .eq("verification_code_hash", verificationCodeHash)
      .eq("status", "unused")
      .maybeSingle();

    if (error) {
      console.error("Invitation lookup failed:", error.message);
      return jsonResponse({ error: "Unable to validate the invitation." }, 500);
    }

    if (!invitation) {
      return jsonResponse(
        { error: "Teacher ID or verification code is invalid or already used." },
        400,
      );
    }

    return jsonResponse({
      valid: true,
      teacherId: invitation.teacher_id,
    });
  } catch (error) {
    console.error(
      "Teacher invitation validation failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonResponse({ error: "Unable to validate the invitation." }, 500);
  }
});
