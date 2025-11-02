"use strict";
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function syncToSupabase(entry, edgeUrl, supabaseUrl, supabaseKey) {
  if (!edgeUrl && !supabaseUrl) return;

  const isUpdate = entry.supabase_id;
  
  if (isUpdate && supabaseUrl && supabaseKey) {
    // Update: Use Supabase REST API directly
    const res = await fetch(`${supabaseUrl}/rest/v1/entries?id=eq.${entry.supabase_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        title: entry.title,
        description: entry.description,
        timestamp: entry.timestamp,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return data?.[0]; // Return first result
  } else if (!isUpdate && edgeUrl) {
    // Create: Use Edge Function
    const res = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: entry.title,
        description: entry.description,
        timestamp: entry.timestamp,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.id) {
      // Store Supabase ID for newly created entries
      await strapi.entityService.update("api::entry.entry", entry.id, {
        data: { supabase_id: data.id },
      });
    }
    return data;
  }
}

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    // Skip if this entry already came from Supabase (has supabase_id)
    // This prevents infinite loops
    if (result.supabase_id) return;

    const edgeUrl = process.env.SUPABASE_EDGE_URL;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    await syncToSupabase(result, edgeUrl, supabaseUrl, supabaseKey);

    // Revalidate Next.js cache if configured
    const revalidateUrl = process.env.NEXT_REVALIDATE_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (revalidateUrl) {
      await fetch(revalidateUrl, {
        method: "POST",
        headers: {
          "x-secret": secret || "",
        },
      }).catch(() => {});
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    // Only sync if we have a Supabase ID (entry exists in Supabase)
    if (!result.supabase_id) return;

    const edgeUrl = process.env.SUPABASE_EDGE_URL;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    await syncToSupabase(result, edgeUrl, supabaseUrl, supabaseKey);

    // Revalidate Next.js cache if configured
    const revalidateUrl = process.env.NEXT_REVALIDATE_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (revalidateUrl) {
      await fetch(revalidateUrl, {
        method: "POST",
        headers: {
          "x-secret": secret || "",
        },
      }).catch(() => {});
    }
  },
};
