
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST" });
  }
  if (req.headers["x-secret"] !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: "Bad secret" });
  }
  try {
    await res.revalidate("/");
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).json({ message: "Error revalidating" });
  }
}
