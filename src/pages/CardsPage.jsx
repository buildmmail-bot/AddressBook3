import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

// ✅ Define your backend URL here
const BASE_URL = "http://localhost:8000";

/* ================= FLIP CARD ================= */
const ImageCard = ({ item, onDelete }) => {
  const [flipped, setFlipped] = useState(false);

  // Helper to construct the full image URL
  const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  // Ensure there is exactly one slash between the host and the path
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};
  // const getImageUrl = (path) => {
  //   if (!path) return null;
  //   // If the path already includes http, return it, otherwise prepend backend URL
  //   return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  // };

  return (
    <div style={{ perspective: 1200, marginBottom: 24, width: "100%", maxWidth: 400 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 240,
          transformStyle: "preserve-3d",
          transition: "0.6s",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          onClick={() => setFlipped(true)}
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            borderRadius: 14,
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid #e5e7eb",
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}
        >
          {item.front_card ? (
            <img
              src={getImageUrl(item.front_card)}
              alt={'${front_card} front card'}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
              No Front Image
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
              borderRadius: 6, padding: 6, display: "flex", alignItems: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>

        {/* BACK */}
        <div
          onClick={() => setFlipped(false)}
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            borderRadius: 14,
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid #e5e7eb",
            background: "#f0fdf4",
          }}
        >
          {item.back_card ? (
            <img
              src={getImageUrl(item.back_card)}
              alt="back"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
              No Back Image
            </div>
          )}
        </div>
      </div>
      {/* Optional: Show Name under the card if available */}
      <p style={{ textAlign: "center", marginTop: 8, fontWeight: 500, fontSize: 14 }}>{item.name}</p>
    </div>
  );
};

/* ================= MAIN ================= */
export default function Cards() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/contacts/`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this card?")) return;
    await fetch(`${BASE_URL}/api/contacts/${id}/`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div style={{ padding: "40px 20px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", background: "#f9fafb", minHeight: "100vh" }}>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <p style={{ color: "#9ca3af", fontSize: 18 }}>No business cards found.</p>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Add contacts in the main dashboard to see cards here.</p>
        </div>
      ) : (
        items.map((item) => (
          <ImageCard key={item.id} item={item} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}