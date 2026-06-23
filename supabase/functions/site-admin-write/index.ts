import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function verifyToken(token: string, secret: string): Promise<{ sub: string; email: string; role: string } | null> {
  try {
    const [b64Payload, signature] = token.split(".");
    if (!b64Payload || !signature) return null;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(b64Payload));
    const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

    if (expected !== signature) return null;

    const payload = JSON.parse(atob(b64Payload));
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const AUTH_TOKEN_SECRET = Deno.env.get("AUTH_TOKEN_SECRET");
  if (!AUTH_TOKEN_SECRET) {
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: AUTH_TOKEN_SECRET not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const user = await verifyToken(token, AUTH_TOKEN_SECRET);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized — invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, table, data, id } = body;

    // Whitelist: only site_-prefixed tables
    if (!table || !table.startsWith("site_")) {
      return new Response(
        JSON.stringify({ error: "Forbidden — only site_ tables allowed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);

    let result;

    switch (action) {
      case "insert": {
        result = await sb.from(table).insert(data).select();
        break;
      }
      case "update": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID required for update" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await sb.from(table).update(data).eq("id", id).select();
        break;
      }
      case "delete": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID required for delete" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await sb.from(table).delete().eq("id", id).select();
        break;
      }
      case "upsert": {
        result = await sb.from(table).upsert(data).select();
        break;
      }
      case "upload_url": {
        // Generate signed upload URL for site-photos bucket
        const { path: filePath } = data;
        if (!filePath) {
          return new Response(
            JSON.stringify({ error: "path required for upload_url" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: signedData, error: signedErr } = await sb.storage
          .from("site-photos")
          .createSignedUploadUrl(filePath);
        if (signedErr) {
          return new Response(
            JSON.stringify({ error: signedErr.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ signedUrl: signedData.signedUrl, path: signedData.path }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ data: result.data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
