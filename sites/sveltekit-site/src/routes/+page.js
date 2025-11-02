export async function load({ fetch }) {
  const base = import.meta.env.VITE_STRAPI_URL ?? 'http://127.0.0.1:1337';
  const res = await fetch(`${base}/api/entries`);
  const json = await res.json();

  const entries = json.data
    ? json.data.map((item) => {
        const attrs = item.attributes || item; // strapi v4 vs v5
        return {
          id: item.id,
          title: attrs.title ?? '',
          description: attrs.description ?? '',
          timestamp: attrs.timestamp ?? ''
        };
      })
    : [];

  return { entries };
}
 