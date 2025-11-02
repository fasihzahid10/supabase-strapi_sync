
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_SUPABASE_FN_URL || "http://localhost:54321/functions/v1/entries";

export default function App() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEntries() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add");
        return;
      }
      setTitle("");
      setDescription("");
      loadEntries();
    } catch (err) {
      setError("Failed to add");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Super Admin Panel</h1>
      <p style={{ color: "#555", marginBottom: "1.5rem" }}>
        Add entries to Supabase (title + description)
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <input
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          style={{
            background: "black",
            color: "white",
            border: "none",
            padding: "8px 18px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2 style={{ marginBottom: "0.5rem" }}>Entries</h2>
      {loading ? (
        <p>Loading...</p>
      ) : entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px 0" }}>
                Title
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px 0" }}>
                Description
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px 0" }}>
                Timestamp
              </th>
            </tr>
          </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "6px 0" }}>{e.title}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "6px 0" }}>{e.description}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "6px 0" }}>
                    {e.timestamp ? new Date(e.timestamp).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      )}

      <button onClick={loadEntries} style={{ marginTop: 16 }}>
        Refresh
      </button>
    </div>
  );
}
