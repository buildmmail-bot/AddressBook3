import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

const BASE_URL = "http://localhost:8000";

const ImageCard = ({ item, onDeleteCard }) => {
  const [flipped, setFlipped] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
  };

  return (
    <div style={{ perspective: 1200, marginBottom: 24, width: "100%", maxWidth: 400 }}>
      <div
        style={{
          position: "relative", width: "100%", height: 240,
          transformStyle: "preserve-3d", transition: "0.6s",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          onClick={() => setFlipped(true)}
          style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            borderRadius: 14, overflow: "hidden", cursor: "pointer",
            border: "1px solid #e5e7eb", background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}
        >
          {item.front_card ? (
            <img src={getImageUrl(item.front_card)} alt="front card"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#9ca3af" }}>No Front Image</div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteCard(item.id, "front_card"); }}
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
            position: "absolute", inset: 0, transform: "rotateY(180deg)",
            backfaceVisibility: "hidden", borderRadius: 14, overflow: "hidden",
            cursor: "pointer", border: "1px solid #e5e7eb", background: "#f0fdf4",
          }}
        >
          {item.back_card ? (
            <img src={getImageUrl(item.back_card)} alt="back"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#6b7280" }}>No Back Image</div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteCard(item.id, "back_card"); }}
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
      </div>
      <p style={{ textAlign: "center", marginTop: 8, fontWeight: 500, fontSize: 14 }}>{item.name}</p>
    </div>
  );
};

export default function Cards() {
  const [items, setItems] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/contacts/`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const handleDeleteCard = (id, field) => {
    setDeleteModal({ id, field });
  };

  const confirmDeleteCard = async () => {
    const { id, field } = deleteModal;

    try {
      const response = await fetch(`${BASE_URL}/api/contacts/${id}/clear-card/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });

      if (response.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, [field]: null } : item
          )
        );
      }
    } catch (error) {
      console.error("Error deleting card:", error);
    }

    setDeleteModal(null);
  };

  return (
    <>
      <div style={{ padding: "40px 20px", display: "flex", flexWrap: "wrap", gap: 24,
        justifyContent: "center", background: "#f9fafb", minHeight: "100vh" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 100 }}>
            <p style={{ color: "#9ca3af", fontSize: 18 }}>No business cards found.</p>
            <p style={{ color: "#9ca3af", fontSize: 14 }}>Add contacts with card images to see them here.</p>
          </div>
        ) : (
          items.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              onDeleteCard={handleDeleteCard}
            />
          ))
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteModal && (
        <div onClick={() => setDeleteModal(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", padding: 28, borderRadius: 14, width: 320,
            textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#111827" }}>
              Are you sure?
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 22px", lineHeight: 1.5 }}>
              The <strong>{deleteModal.field === "front_card" ? "front" : "back"}</strong> card image will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14,
                border: "1px solid #e5e7eb", background: "#fff",
                cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={confirmDeleteCard} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14,
                border: "none", background: "#ef4444",
                color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}