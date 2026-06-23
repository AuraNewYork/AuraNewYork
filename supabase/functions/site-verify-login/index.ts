import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  return crypto.subtle
    .importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, enc.encode(payload)))
    .then((sig) => {
      const arr = new Uint8Array(sig);
      return Array.from(arr)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const AUTH_TOKEN_SECRET = Deno.env.get("AUTH_TOKEN_SECRET");
  if (!AUTH_TOKEN_SECRET) {
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: AUTH_TOKEN_SECRET not set. Contact admin." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);

    const { data: profile, error } = await sb
      .from("profiles")
      .select("id, email, password, full_name, role")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error || !profile) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.password !== password) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ALLOWED_ROLES = ["admin"];
    if (!ALLOWED_ROLES.includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions — admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create signed token
    const payload = JSON.stringify({
      sub: profile.id,
      email: profile.email,
      role: profile.role,
      exp: Date.now() + 12 * 60 * 60 * 1000,
    });
    const b64Payload = btoa(payload);
    const signature = await hmacSign(b64Payload, AUTH_TOKEN_SECRET);
    const token = `${b64Payload}.${signature}`;

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
