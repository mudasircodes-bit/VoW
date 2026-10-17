
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Missing Supabase environment variables.");
      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        { error: "Please sign in as an administrator." },
        401,
      );
    }

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

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: role, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      console.error("Role lookup failed:", roleError.message);
      return jsonResponse({ error: "Could not verify permissions." }, 500);
    }

    if (role?.role !== "admin") {
      return jsonResponse({ error: "Administrator access required." }, 403);
    }

    let body: { applicationId?: unknown; action?: unknown };

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON request body." }, 400);
    }

    if (
      typeof body.applicationId !== "number" ||
      !Number.isSafeInteger(body.applicationId) ||
      body.applicationId <= 0
    ) {
      return jsonResponse({ error: "Invalid application ID." }, 400);
    }

    if (body.action !== "approve" && body.action !== "reject") {
      return jsonResponse(
        { error: "Action must be approve or reject." },
        400,
      );
    }

    const { data, error } = await adminClient.rpc(
      "review_teacher_application",
      {
        p_application_id: body.applicationId,
        p_action: body.action,
        p_admin_id: user.id,
      },
    );

    if (error) {
      console.error("Application review failed:", error.message);
      return jsonResponse(
        { error: "Could not review this application. Check its invitation and status." },
        400,
      );
    }

    return jsonResponse(data);
  } catch (error) {
    console.error("Review application error:", error);
    return jsonResponse({ error: "An unexpected error occurred." }, 500);
  }
});
