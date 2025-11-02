// @ts-ignore
const fetch = (...args: any[]) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

export default {
  async sync(ctx: any) {
    const body = ctx.request.body || {};
    const { id, title, description, timestamp } = body;

    if (!title) {
      ctx.badRequest('title required');
      return;
    }

    const existing = await strapi.entityService.findMany('api::entry.entry', {
      filters: { supabase_id: id },
      limit: 1,
    });

    if (existing.length > 0) {
      const updated = await strapi.entityService.update('api::entry.entry', existing[0].id, {
        data: {
          title,
          description,
          timestamp,
          publishedAt: existing[0].publishedAt || new Date(),
        },
      });

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      console.log('supabaseUrl', supabaseUrl)
      console.log('supabaseKey', supabaseKey)
      if (supabaseUrl && supabaseKey) {
        try {
          const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/entries?id=eq.${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=representation",
            },
            body: JSON.stringify({
              title,
              description,
              timestamp,
            }),
          });
          
          if (!supabaseRes.ok) {
            const errorText = await supabaseRes.text();
            console.error(`Failed to update Supabase: ${supabaseRes.status} - ${errorText}`);
          }
        } catch (err: any) {
          console.error("Failed to update Supabase:", err.message);
        }
      } else {
        console.warn("Supabase URL or Key not configured - skipping Supabase update");
      }

      ctx.body = { ok: true, updated: true, strapi: updated, supabase: supabaseUrl ? "attempted" : "not configured" };
      return;
    }

    await strapi.entityService.create('api::entry.entry', {
      data: {
        title,
        description,
        timestamp,
        supabase_id: id,
        publishedAt: new Date(), 
      },
    });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
    const edgeUrl = process.env.SUPABASE_EDGE_URL;
    
    if (edgeUrl) {
      try {
        await fetch(edgeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            timestamp,
          }),
        });
      } catch (err) {
        console.error("Failed to create in Supabase:", err);
      }
    } else if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/entries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "return=representation",
          },
          body: JSON.stringify({
            id, 
            title,
            description,
            timestamp,
          }),
        });
      } catch (err) {
        console.error("Failed to create in Supabase:", err);
      }
    }

    ctx.body = { ok: true, created: true };
  },
};

