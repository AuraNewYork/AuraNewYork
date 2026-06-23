import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current.trim());
        current = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(current.trim());
        if (row.some((c) => c !== "")) rows.push(row);
        row = [];
        current = "";
      } else {
        current += ch;
      }
    }
  }
  row.push(current.trim());
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

interface Unit {
  building: string;
  unit: string;
  bed: string;
  bath: string;
  sqft: string;
  status: string;
  gross: string;
  concession: string;
  term: string;
  net: number;
  exposure: string;
  balcony: string;
  expiry: string;
  video: string;
  floorPlan: string;
  matterport: string;
  pics: string;
}

interface GroupedResult {
  layout: string;
  units: (Unit & { tag?: string })[];
}

function parseRow(cols: string[]): Unit | null {
  const building = cols[0] || "";
  const unit = cols[1] || "";
  const status = cols[5] || "";
  const netRaw = cols[11] || "";
  const net = parseFloat(netRaw.replace(/[$,]/g, ""));

  if (!building || !unit || net <= 0) return null;
  if (!status.toLowerCase().includes("vacant")) return null;

  let bed = cols[2] || "";
  if (bed.toLowerCase() === "conv") bed = "Convertible";

  return {
    building,
    unit,
    bed,
    bath: cols[3] || "",
    sqft: cols[4] || "",
    status,
    gross: cols[8] || "",
    concession: cols[9] || "",
    term: cols[10] || "",
    net,
    exposure: cols[12] || "",
    balcony: cols[13] || "",
    expiry: cols[20] || "",
    video: cols[29] || "",
    floorPlan: cols[30] || "",
    matterport: cols[31] || "",
    pics: cols[32] || "",
  };
}

async function fetchFromSheets(
  csvUrls: string[]
): Promise<Unit[]> {
  const allUnits: Unit[] = [];
  const seen = new Set<string>();

  for (const url of csvUrls) {
    if (!url) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      const rows = parseCsv(text);

      for (let i = 1; i < rows.length; i++) {
        const unit = parseRow(rows[i]);
        if (!unit) continue;
        const key = `${unit.building}-${unit.unit}`;
        if (seen.has(key)) continue;
        seen.add(key);
        allUnits.push(unit);
      }
    } catch {
      // Skip failed URLs
    }
  }

  return allUnits;
}

async function fetchFromSupabase(): Promise<Unit[]> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
  const sb = createClient(url, key);

  const { data, error } = await sb.from("site_units").select("*");
  if (error || !data) return [];

  const units: Unit[] = [];
  const seen = new Set<string>();

  for (const row of data) {
    const net = parseFloat(String(row.net || "0"));
    if (!row.building || !row.unit || net <= 0) continue;
    if (row.status && !row.status.toLowerCase().includes("vacant")) continue;

    const key = `${row.building}-${row.unit}`;
    if (seen.has(key)) continue;
    seen.add(key);

    units.push({
      building: row.building,
      unit: row.unit,
      bed: row.bed === "conv" ? "Convertible" : (row.bed || ""),
      bath: row.bath || "",
      sqft: row.sqft || "",
      status: row.status || "",
      gross: row.gross || "",
      concession: row.concession || "",
      term: row.term || "",
      net,
      exposure: row.exposure || "",
      balcony: row.balcony || "",
      expiry: row.expiry || "",
      video: row.video || "",
      floorPlan: row.floor_plan || "",
      matterport: row.matterport || "",
      pics: row.pics || "",
    });
  }

  return units;
}

function groupUnits(units: Unit[]): GroupedResult[] {
  const groups = new Map<string, Unit[]>();

  for (const u of units) {
    const key = `${u.bed}bed-${u.bath}bath`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(u);
  }

  const results: GroupedResult[] = [];

  for (const [layout, groupUnits] of groups) {
    const sorted = groupUnits.sort((a, b) => a.net - b.net);
    const tagged = sorted.map((u, i) => {
      let tag: string | undefined;
      if (sorted.length > 1) {
        if (i === 0) tag = "Best Value";
        if (i === sorted.length - 1) tag = "Premium";
      }
      return { ...u, tag };
    });
    results.push({ layout, units: tagged });
  }

  return results.sort((a, b) => a.layout.localeCompare(b.layout));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);

    // Check data source setting
    const { data: settingData } = await sb
      .from("site_settings")
      .select("value")
      .eq("key", "availability_source")
      .maybeSingle();

    const source = settingData?.value || "sheets";

    let units: Unit[];

    if (source === "supabase") {
      units = await fetchFromSupabase();
    } else {
      // Get CSV URLs from settings or use defaults
      const { data: csvData } = await sb
        .from("site_settings")
        .select("key, value")
        .in("key", ["csv_url_moinian", "csv_url_fresh"]);

      const csvMap: Record<string, string> = {};
      if (csvData) {
        csvData.forEach((r: { key: string; value: unknown }) => {
          csvMap[r.key] = String(r.value || "").replace(/^"|"$/g, "");
        });
      }

      const moinianUrl =
        csvMap["csv_url_moinian"] ||
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2qDSRqh6cJzN5qFRZ9Yk8w3M9bGlLoYwT7ot_DnMBLfUTHpL8iMW5kOTp1iYcJv4_Hpu-2JTJNHhX/pub?gid=799951236&single=true&output=csv";
      const freshUrl =
        csvMap["csv_url_fresh"] ||
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPJ9T15cta8kerjm2kU5vo9ZpZ5ou39AudKfOURoNh3V8g6gqaRJPI-sVlJGBPu3YnDVFqnfEExx3N/pub?gid=799951236&single=true&output=csv";

      units = await fetchFromSheets([moinianUrl, freshUrl]);
    }

    const grouped = groupUnits(units);

    return new Response(
      JSON.stringify({ source, total: units.length, groups: grouped, units }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
