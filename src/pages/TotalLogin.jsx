import { useEffect, useState } from "react";
import {
  Users, CreditCard, QrCode, UserPlus, Search,
  Pencil, Trash2, Eye, EyeOff, X, Check
} from "lucide-react";

const API = "http://127.0.0.1:8000/api/admins/";

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "??";

const avatarColors = [
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#ede9fe", text: "#5b21b6" },
];
const getColor = (id) => avatarColors[id % avatarColors.length];

// ─── Input field helper ───────────────────────────────────────────────────────
const Field = ({ label, type = "text", value, onChange, error, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 500,
      color: "#374151", marginBottom: 4 }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
        border: `1px solid ${error ? "#ef4444" : "#e5e7eb"}`,
        outline: "none", boxSizing: "border-box", background: "#fff",
      }}
    />
    {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</p>}
  </div>
);

// ─── Password field with show/hide ───────────────────────────────────────────
const PasswordField = ({ label, value, onChange, error, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500,
        color: "#374151", marginBottom: 4 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          style={{
            width: "100%", padding: "9px 40px 9px 12px", borderRadius: 8,
            fontSize: 14, border: `1px solid ${error ? "#ef4444" : "#e5e7eb"}`,
            outline: "none", boxSizing: "border-box", background: "#fff",
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{ position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)", background: "none",
            border: "none", cursor: "pointer", color: "#6b7280", padding: 0 }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
};

export default function AdminPage() {
  const [admins, setAdmins]         = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch]         = useState("");
  const [sideSearch, setSideSearch] = useState("");

  // modal state
  const [showModal, setShowModal]   = useState(false);
  const [editAdmin, setEditAdmin]   = useState(null);
  const [deleteId, setDeleteId]     = useState(null);

  // form
  const [form, setForm]   = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // password visibility per row
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // fetch admins
  const fetchAdmins = async (q = "") => {
    try {
      const res = await fetch(`${API}?search=${q}`);
     const data = await res.json();
      const actualData = Array.isArray(data) ? data : (data.results || []);
  
      setAdmins(actualData);
      setTotalCount(data.count|| actualData.length);
    } catch (error) {
      console.error("Failed to fetch admins");
      setAdmins([]);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchAdmins(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // open add modal
  const openAdd = () => {
    setEditAdmin(null);
    setForm({ name: "", email: "", password: "" });
    setErrors({});
    setShowModal(true);
  };

  // open edit modal
  const openEdit = (admin) => {
    setEditAdmin(admin);
    setForm({ name: admin.name, email: admin.email, password: admin.password });
    setErrors({});
    setShowModal(true);
  };

  // validate
  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Name is required";
    if (!form.email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!editAdmin && !form.password.trim()) e.password = "Password is required";
    else if (form.password && form.password.length < 6)
      e.password = "Minimum 6 characters";
    return e;
  };

  // submit
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const method  = editAdmin ? "PUT" : "POST";
      const url     = editAdmin ? `${API}${editAdmin.id}/` : API;
      const payload = { ...form };
      if (editAdmin && !form.password) delete payload.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchAdmins(search);
      } else {
        const err = await res.json();
        if (err.email) setErrors({ email: "Email already exists" });
      }
    } finally {
      setLoading(false);
    }
  };

  // delete
  const handleDelete = async (id) => {
    await fetch(`${API}${id}/`, { method: "DELETE" });
    setDeleteId(null);
    fetchAdmins(search);
  };

  const togglePassword = (id) =>
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  // sidebar search filter (client-side on already-fetched list)
  const filteredBySide = sideSearch
    ? admins.filter(
        (a) =>
          a.name.toLowerCase().includes(sideSearch.toLowerCase()) ||
          a.email.toLowerCase().includes(sideSearch.toLowerCase())
      )
    : admins;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif",
      background: "#f9fafb" }}>

    

        {/* Logo */}
        {/* <div style={{ display: "flex", alignItems: "center", gap: 10,
          padding: "0 20px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ width: 32, height: 32, background: "#d1fae5",
            borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: "center" }}>
            <Users size={18} color="#16a34a" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
            Admin Dashboard
          </span>
        </div>

  

       
{/*  */}
     

       
        {/* <div style={{ padding: "0 12px" }}>
          <button onClick={openAdd} style={{
            width: "100%", padding: "10px 0", borderRadius: 10,
            background: "#16a34a", color: "#fff", border: "none",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <UserPlus size={16} /> Add Admin
          </button>
        </div> */}
    

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column",
        overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb",
          padding: "14px 24px", display: "flex",
          alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Admin List &nbsp;
            <span style={{ fontSize: 15, fontWeight: 500, color: "#6b7280" }}>
           ({filteredBySide ? filteredBySide.length : 0})
            </span>
          </h2>

          {/* Table search */}
          <div style={{ position: "relative" }}>
            <Search size={15} color="#9ca3af"
              style={{ position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)" }} />
            <input
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8,
                paddingBottom: 8, borderRadius: 8, fontSize: 14,
                border: "1px solid #e5e7eb", outline: "none",
                width: 220, background: "#f9fafb" }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse",
            background: "#fff", borderRadius: 12, overflow: "hidden",
            marginTop: 20, border: "2px solid #479a44" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Name", "Email", "Password", ].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                    fontSize: 12, fontWeight: 600, color: "#1d6e36",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
         <tbody>
  {/* 1. Check if filteredBySide is empty or not an array */}
  {!Array.isArray(filteredBySide) || filteredBySide.length === 0 ? (
    <tr>
      <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
        No admins found
      </td>
    </tr>
  ) : (
    /* 2. Map through the array safely */
    filteredBySide.map((admin) => {
      if (!admin) return null; 
      const col = getColor(admin.id || 0);
      
      return (
        <tr key={admin.id || Math.random()}
          style={{ borderBottom: "1px solid #f3f4f6" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          {/* Name Column */}
          <td style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%",
                background: col.bg, color: col.text, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                {getInitials(admin.name)}
              </div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: "#111827" }}>
                {admin.name}
              </p>
            </div>
          </td>

          {/* Email Column */}
          <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
            {admin.email}
          </td>

          {/* Password Column - FIXED FOR LENGTH ERROR */}
          <td style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#374151",
                letterSpacing: visiblePasswords[admin.id] ? 0 : 2 }}>
                {visiblePasswords[admin.id] 
                  ? (admin.password || "") 
                  : "•".repeat(Math.min((admin.password || "").length, 10))}
              </span>
              <button onClick={() => togglePassword(admin.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
                {visiblePasswords[admin.id] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </td>

         
        </tr>
      );
    })
  )}
</tbody>
             
                     
      
          </table>
        </div>
      </main>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 14, padding: 28,
            width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>
                {editAdmin ? "Edit Admin" : "Add Admin"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#9ca3af", padding: 0 }}>
                <X size={20} />
              </button>
            </div>

            <Field label="Name" value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              error={errors.name} placeholder="Enter full name" />

            <Field label="Email" type="email" value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              error={errors.email} placeholder="Enter email address" />

            <PasswordField
              label={editAdmin ? "Password (leave blank to keep)" : "Password"}
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              error={errors.password} />

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14,
                border: "1px solid #e5e7eb", background: "#fff",
                cursor: "pointer", fontWeight: 500,
              }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading} style={{
                flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14,
                border: "none", background: loading ? "#86efac" : "#16a34a",
                color: "#fff", cursor: "pointer", fontWeight: 600,
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6,
              }}>
                <Check size={15} />
                {loading ? "Saving..." : editAdmin ? "Save Changes" : "Add Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div onClick={() => setDeleteId(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 14, padding: "28px 28px 22px",
            width: 320, textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%",
              background: "#fee2e2", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700,
              color: "#111827" }}>Are you sure?</h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 22px",
              lineHeight: 1.5 }}>
              This admin will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14,
                border: "1px solid #e5e7eb", background: "#fff",
                cursor: "pointer", fontWeight: 500,
              }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14,
                border: "none", background: "#ef4444",
                color: "#fff", cursor: "pointer", fontWeight: 600,
              }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}