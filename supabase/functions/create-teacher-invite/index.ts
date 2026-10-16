import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function randomCode(length: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

async function hashCode(code: string) {
  const data = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Please sign in as an administrator." }, 401);
    }

    // Validate the caller's actual Supabase session.
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Your session is invalid or expired." }, 401);
    }

    // Use the service role only on the server to check permissions and write records.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: role, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError || role?.role !== "admin") {
      return jsonResponse({ error: "Administrator access required." }, 403);
    }

    const teacherId = `TCH-${new Date().getFullYear()}-${randomCode(6)}`;
    const verificationCode = randomCode(12);
    const verificationCodeHash = await hashCode(verificationCode);

    const { error: insertError } = await adminClient
      .from("teacher_invites")
      .insert({
        teacher_id: teacherId,
        verification_code_hash: verificationCodeHash,
        status: "unused",
        created_by: user.id,
      });

    if (insertError) {
      console.error("Could not create teacher invite:", insertError.message);

      return jsonResponse({
        error: "Could not create credentials. Please try again.",
      }, 500);
    }

    // The private code is returned only at creation time.
    return jsonResponse({
      teacherId,
      verificationCode,
      message: "Teacher credentials created successfully.",
    });
  } catch (error) {
    console.error("Teacher invite error:", error);

    return jsonResponse({
      error: "An unexpected error occurred while creating credentials.",
    }, 500);
  }
});