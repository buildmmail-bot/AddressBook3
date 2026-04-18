import { useEffect, useState } from "react";
import {
  Users, Search, Pencil, Trash2, Eye, EyeOff, X, Check,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api/admins/";
const RESET_API = "http://127.0.0.1:8000/api/password-reset/";

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
        <button type="button" onClick={() => setShow(!show)}
          style={{ position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)", background: "none",
            border: "none", cursor: "pointer", color: "#6b7280", padding: 0 }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
};

/* ── Mobile Admin Card ── */
const AdminCard = ({
  admin, visiblePasswords, togglePassword, setWarningMsg,
  setViewAdmin, openEdit, setDeleteId,
}) => {
  const col = getColor(admin.id || 0);
  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
      padding: "14px 16px", marginBottom: 10,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: col.bg, color: col.text,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600, fontSize: 14, flexShrink: 0,
        }}>
          {getInitials(admin.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {admin.name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {admin.email}
          </p>
        </div>
      </div>

      {/* Password row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "7px 10px", background: "#f9fafb", borderRadius: 8, marginBottom: 10,
      }}>
        <span style={{ fontSize: 12, color: "#6b7280", marginRight: "auto" }}>Password</span>
        <span style={{ fontSize: 13, color: "#374151", letterSpacing: 2 }}>
          {visiblePasswords[admin.id]
            ? (admin.password && admin.password.startsWith("pbkdf2")
              ? "Not available"
              : (admin.password || "Not set"))
            : "••••••••"}
        </span>
        <button
          onClick={() => {
            const loggedInEmail = localStorage.getItem("adminEmail");
            if (admin.email !== loggedInEmail) {
              setWarningMsg("You cannot view another admin's password.");
              return;
            }
            togglePassword(admin.id);
          }}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", padding: 0, flexShrink: 0 }}>
          {visiblePasswords[admin.id] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* Actions row */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setViewAdmin(admin)}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "7px 0", borderRadius: 7,
            border: "1px solid #a9ecb2", background: "#f0fdf4",
            cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#16a34a",
          }}>
          <Users size={11} /> View
        </button>
        <button onClick={() => {
          const loggedInEmail = localStorage.getItem("adminEmail");
          if (admin.email !== loggedInEmail) {
            setWarningMsg("You cannot edit another admin's details.");
            return;
          }
          openEdit(admin);
        }}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "7px 0", borderRadius: 7,
            border: "1px solid #e5e7eb", background: "#fff",
            cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#111827",
          }}>
          <Pencil size={11} /> Edit
        </button>
        <button onClick={() => setDeleteId(admin.id)}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "7px 0", borderRadius: 7,
            border: "none", background: "#ef4444",
            cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#fff",
          }}>
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [admins, setAdmins]         = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch]         = useState("");

  const [showModal, setShowModal]   = useState(false);
  const [editAdmin, setEditAdmin]   = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [viewAdmin, setViewAdmin]   = useState(null);

  const [resetAdmin, setResetAdmin]       = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm]   = useState("");
  const [resetError, setResetError]       = useState("");
  const [resetSuccess, setResetSuccess]   = useState("");
  const [resetLoading, setResetLoading]   = useState(false);

  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [warningMsg, setWarningMsg] = useState(null);

  /* responsive: track viewport width */
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const fetchAdmins = async (q = "") => {
    try {
      const res = await fetch(`${API}?search=${q}`);
      const data = await res.json();
      const actualData = Array.isArray(data) ? data : (data.results || []);
      setAdmins(actualData);
      setTotalCount(data.count || actualData.length);
    } catch {
      setAdmins([]);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchAdmins(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => {
    setEditAdmin(null);
    setForm({ name: "", email: "", password: "" });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (admin) => {
    setEditAdmin(admin);
    setForm({ name: admin.name, email: admin.email, password: admin.password });
    setErrors({});
    setShowModal(true);
  };

  const openReset = (admin) => {
    setResetAdmin(admin);
    setResetPassword(""); setResetConfirm("");
    setResetError(""); setResetSuccess("");
  };

  const handleReset = async () => {
    if (!resetPassword.trim()) { setResetError("Password is required"); return; }
    if (resetPassword.length < 6) { setResetError("Minimum 6 characters"); return; }
    if (resetPassword !== resetConfirm) { setResetError("Passwords do not match"); return; }
    setResetLoading(true);
    try {
      const res = await fetch(RESET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetAdmin.email, new_password: resetPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess("Password reset successfully!");
        setResetError("");
        fetchAdmins(search);
        setTimeout(() => setResetAdmin(null), 1500);
      } else {
        setResetError(data.error || "Failed to reset password");
      }
    } catch {
      setResetError("Something went wrong");
    } finally {
      setResetLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!editAdmin && !form.password.trim()) e.password = "Password is required";
    else if (form.password && form.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

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
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowModal(false);
        await fetchAdmins(search);
      } else {
        const err = await res.json();
        if (err.email) setErrors({ email: "Email already exists" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}${id}/`, { method: "DELETE" });
    setDeleteId(null);
    fetchAdmins(search);
  };

  const togglePassword = (id) =>
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  /* overlay styles shared across modals */
  const overlayStyle = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(4px)", display: "flex",
    alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: 16,   /* padding keeps modal from touching screen edges */
  };

  const modalStyle = {
    background: "#fff", borderRadius: 14,
    padding: isMobile ? "20px 16px" : "28px",
    width: "100%", maxWidth: 400,
    maxHeight: "90vh", overflowY: "auto",
    boxSizing: "border-box",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100vh", fontFamily: "sans-serif", background: "#f9fafb",
      width: "100%", overflowX: "hidden", boxSizing: "border-box",
    }}>

      {/* ── Warning overlay ── */}
      {warningMsg && (
        <div onClick={() => setWarningMsg(null)} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", padding: isMobile ? "24px 20px" : 32,
            borderRadius: 16, width: "100%", maxWidth: 340,
            textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%",
              background: "#fef9c3", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#111" }}>
              Access Denied
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>{warningMsg}</p>
            <button onClick={() => setWarningMsg(null)}
              style={{ padding: "10px 32px", borderRadius: 8, border: "none",
                background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        padding: isMobile ? "12px 20px" : "14px 24px",
        display: "flex", alignItems: "center",
        flexWrap: "wrap", gap: 10,
        justifyContent: "space-between",
      }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#111827" }}>
          Total Admins&nbsp;
          <span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>
            ({admins.length})
          </span>
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#9ca3af"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                borderRadius: 8, fontSize: 13, border: "1px solid #e5e7eb",
                outline: "none", width: isMobile ? 160 : 220, background: "#f9fafb",
              }}
            />
          </div>
          <button onClick={openAdd}
            style={{
              padding: "8px 14px", borderRadius: 8, border: "none",
              background: "#16a34a", color: "#fff", fontWeight: 600,
              fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
            }}>
            + Add Admin
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: isMobile ? "16px 20px" : "16px 24px 24px" }}>

        {/* Mobile: card list */}
        {isMobile ? (
          admins.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, marginTop: 40 }}>
              No admins found
            </p>
          ) : (
            admins.map((admin) => admin && (
              <AdminCard
                key={admin.id || Math.random()}
                admin={admin}
                visiblePasswords={visiblePasswords}
                togglePassword={togglePassword}
                setWarningMsg={setWarningMsg}
                setViewAdmin={setViewAdmin}
                openEdit={openEdit}
                setDeleteId={setDeleteId}
              />
            ))
          )
        ) : (
          /* Desktop: table */
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", background: "#fff",
              borderRadius: 12, overflow: "hidden", marginTop: 4,
              border: "2px solid #479a44",
            }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Name", "Email", "Password", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 12, fontWeight: 600, color: "#1d6e36",
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: "center",
                      color: "#9ca3af", fontSize: 14 }}>No admins found</td>
                  </tr>
                ) : (
                  admins.map((admin) => {
                    if (!admin) return null;
                    const col = getColor(admin.id || 0);
                    return (
                      <tr key={admin.id || Math.random()}
                        style={{ borderBottom: "1px solid #f3f4f6" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

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

                        <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                          {admin.email}
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, color: "#374151", letterSpacing: 2 }}>
                              {visiblePasswords[admin.id]
                                ? (admin.password && admin.password.startsWith("pbkdf2")
                                  ? "Not available"
                                  : (admin.password || "Not set"))
                                : "••••••••"}
                            </span>
                            <button
                              onClick={() => {
                                const loggedInEmail = localStorage.getItem("adminEmail");
                                if (admin.email !== loggedInEmail) {
                                  setWarningMsg("You cannot view another admin's password.");
                                  return;
                                }
                                togglePassword(admin.id);
                              }}
                              style={{ background: "none", border: "none", cursor: "pointer",
                                color: "#9ca3af", padding: 0 }}>
                              {visiblePasswords[admin.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button onClick={() => setViewAdmin(admin)}
                              style={{ display: "flex", alignItems: "center", gap: 3,
                                padding: "5px 10px", borderRadius: 6,
                                border: "1px solid #a9ecb2", background: "#f0fdf4",
                                cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
                              <Users size={11} /> View
                            </button>
                            <button onClick={() => {
                              const loggedInEmail = localStorage.getItem("adminEmail");
                              if (admin.email !== loggedInEmail) {
                                setWarningMsg("You cannot edit another admin's details.");
                                return;
                              }
                              openEdit(admin);
                            }}
                              style={{ display: "flex", alignItems: "center", gap: 3,
                                padding: "5px 10px", borderRadius: 6,
                                border: "1px solid #e5e7eb", background: "#fff",
                                cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#111827" }}>
                              <Pencil size={11} /> Edit
                            </button>
                            <button onClick={() => setDeleteId(admin.id)}
                              style={{ display: "flex", alignItems: "center", gap: 3,
                                padding: "5px 10px", borderRadius: 6, border: "none",
                                background: "#ef4444", cursor: "pointer",
                                fontSize: 12, fontWeight: 600, color: "#fff" }}>
                              <Trash2 size={12} /> Delete
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
        )}
      </div>

      {/* ── VIEW MODAL ── */}
      {viewAdmin && (
        <div onClick={() => setViewAdmin(null)} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={{
            ...modalStyle,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                View Admin
              </h3>
              <button onClick={() => setViewAdmin(null)} style={{
                background: "#f3f4f6", border: "none", cursor: "pointer",
                borderRadius: "50%", width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ width: 72, height: 72, borderRadius: "50%",
              background: getColor(viewAdmin.id || 0).bg,
              color: getColor(viewAdmin.id || 0).text,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
              {getInitials(viewAdmin.name)}
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827",
              textAlign: "center" }}>
              {viewAdmin.name}
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6b7280",
              textAlign: "center", wordBreak: "break-all" }}>
              {viewAdmin.email}
            </p>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", background: "#f9fafb", borderRadius: 8 }}>
                <Users size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Full Name</div>
                  <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>
                    {viewAdmin.name}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", background: "#f9fafb", borderRadius: 8 }}>
                <Search size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 14, color: "#111827", fontWeight: 500,
                    wordBreak: "break-all" }}>
                    {viewAdmin.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>
                {editAdmin ? "Edit Admin" : "Add Admin"}
              </h3>
              <button onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer",
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
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14,
                  border: "1px solid #e5e7eb", background: "#fff",
                  cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14,
                  border: "none", background: loading ? "#86efac" : "#16a34a",
                  color: "#fff", cursor: "pointer", fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Check size={15} />
                {loading ? "Saving..." : editAdmin ? "Save Changes" : "Add Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div onClick={() => setDeleteId(null)} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={{
            ...modalStyle, maxWidth: 320, textAlign: "center",
          }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#111827" }}>
              Are you sure?
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 22px", lineHeight: 1.5 }}>
              This admin will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14,
                  border: "1px solid #e5e7eb", background: "#fff",
                  cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 14,
                  border: "none", background: "#ef4444",
                  color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}