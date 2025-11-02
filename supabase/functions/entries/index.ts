// supabase/functions/entries/index.ts
// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

// this will read from your local supabase .env
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  serve(async (req) => {
    if (req.method === "POST") {
      const { title, description, timestamp } = await req.json();

      if (!title) {
        return new Response(JSON.stringify({ error: "title required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("entries")
        .insert([{ title, description, timestamp: timestamp || new Date().toISOString() }])
        .select()
        .single();

    if (error) {
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sync to Strapi after creating in Supabase
    // For Docker/remote contexts, try host.docker.internal or set STRAPI_URL env var
    const strapiUrl = Deno.env.get("STRAPI_URL") || 
      Deno.env.get("STRAPI_LOCAL_URL") || 
      "http://host.docker.internal:1337";
    try {
      console.log(`Syncing entry ${data.id} to Strapi at ${strapiUrl}/api/supabase-sync`);
      const syncRes = await fetch(`${strapiUrl}/api/supabase-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          title: data.title,
          description: data.description,
          timestamp: data.timestamp,
        }),
      });
      
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        console.log(`Successfully synced to Strapi:`, syncData);
      } else {
        const errorText = await syncRes.text();
        console.error(`Failed to sync to Strapi: ${syncRes.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Error syncing to Strapi:", err);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "PUT") {
    const url = new URL(req.url);
    const entryId = url.pathname.split("/").pop();
    const { title, description, timestamp } = await req.json();

    if (!entryId || !title) {
      return new Response(JSON.stringify({ error: "entry ID and title required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("entries")
      .update({ title, description, timestamp })
      .eq("id", entryId)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sync to Strapi after updating in Supabase
    // For Docker/remote contexts, try host.docker.internal or set STRAPI_URL env var
    const strapiUrl = Deno.env.get("STRAPI_URL") || 
      Deno.env.get("STRAPI_LOCAL_URL") || 
      "http://host.docker.internal:1337";
    try {
      console.log(`Syncing update for entry ${data.id} to Strapi at ${strapiUrl}/api/supabase-sync`);
      const syncRes = await fetch(`${strapiUrl}/api/supabase-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          title: data.title,
          description: data.description,
          timestamp: data.timestamp,
        }),
      });
      
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        console.log(`Successfully synced update to Strapi:`, syncData);
      } else {
        const errorText = await syncRes.text();
        console.error(`Failed to sync update to Strapi: ${syncRes.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Error syncing update to Strapi:", err);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase.from("entries").select("*");
    if (error) {
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/entries' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
