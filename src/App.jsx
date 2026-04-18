import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Users, CreditCard, QrCode, UserPlus, X, LogOut, Menu } from "lucide-react";
import { ContactsProvider } from "./context/ContactsContext";
import ContactList from "./ContactList.jsx";
import UsersPage from "./pages/CardsPage.jsx";
import AdminLogin from "./Adminlogin.jsx";
import AdminPage from "./pages/TotalLogin.jsx";

/* ── ADD ADMIN MODAL ── */
function AddAdminModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!name || !email || !password) {
      setError("Name, Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/admins/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Admin added successfully!");
        setTimeout(() => onClose(), 2000);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: 32,
        width: "100%", maxWidth: 380,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
          <X size={20} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 20 }}>Add New Admin</h2>
        {message && <p style={{ color: "#16a34a", background: "#dcfce7", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{message}</p>}
        {error && <p style={{ color: "#dc2626", background: "#fee2e2", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</p>}
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 16, outline: "none" }} />
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="newadmin@example.com"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 16, outline: "none" }} />
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 24, outline: "none" }} />
        <button onClick={handleAdd} disabled={loading}
          style={{ width: "100%", padding: "11px 0", borderRadius: 8, background: "#22c55e", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Adding..." : "Add Admin"}
        </button>
      </div>
    </div>
  );
}

/* ── SIDEBAR ── */
function Sidebar({ activePage, setActivePage, onLogout, isOpen, onClose, isMobile }) {
  const [showModal, setShowModal] = useState(false);

  const navItem = (page, icon, label) => (
    <button
      onClick={() => { setActivePage(page); onClose(); }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 10,
        fontSize: 14, fontWeight: 600, width: "100%",
        background: activePage === page ? "#dcfce7" : "transparent",
        color: activePage === page ? "#16a34a" : "#6b7280",
        border: "none", cursor: "pointer", textAlign: "left",
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <>
      {/* Dimmed backdrop on mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 998,
          }}
        />
      )}

      <aside style={{
        width: 220,
        borderRight: "1px solid #e5e7eb",
        background: "#fff",
        // FIX: use padding on inner content, not on aside itself, to avoid height overflow.
        // Instead, we rely on flexbox children for spacing.
        padding: "20px 20px 0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxSizing: "border-box",          // FIX: padding included in height calc
        // Mobile: slide in/out as fixed overlay
        position: isMobile ? "fixed" : "relative",
        top: 0,
        left: isMobile ? (isOpen ? 0 : -240) : 0,
        // FIX: height fills viewport but padding-bottom via a spacer instead
        height: "100vh",
        overflowY: "auto",               // FIX: scroll if content exceeds screen height
        overflowX: "hidden",
        zIndex: 999,
        transition: "left 0.3s ease",
        boxShadow: isMobile && isOpen ? "4px 0 20px rgba(0,0,0,0.15)" : "none",
        flexShrink: 0,
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, margin: 0, color: "#111" }}>
            <Users size={20} color="#22c55e" /> Admin
          </h1>
          {isMobile && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav items */}
        {navItem("contacts", <Users size={16} />, "Contact List")}
        {navItem("cards", <CreditCard size={16} />, "Cards")}
        {navItem("qr", <QrCode size={16} />, "AdminList")}

        {/* FIX: bottom buttons use marginTop auto + paddingBottom so they're never cut off */}
        <div style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          paddingBottom: 20,      // FIX: ensures logout is not flush with screen bottom
          paddingTop: 12,
        }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              color: "#16a34a", background: "#dcfce7",
              border: "none", cursor: "pointer", width: "100%",
            }}>
            <UserPlus size={16} /> Add Admin
          </button>
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              color: "#dc2626", background: "#fee2e2",
              border: "none", cursor: "pointer", width: "100%",
            }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {showModal && <AddAdminModal onClose={() => setShowModal(false)} />}
    </>
  );
}

/* ── DASHBOARD ── */
function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("contacts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderPage = () => {
    if (activePage === "contacts") return <ContactList />;
    if (activePage === "cards") return <UsersPage />;
    if (activePage === "qr") return <AdminPage />;
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      fontFamily: "'Inter', sans-serif",
      background: "#f9fafb",
      overflow: "hidden",          // FIX: prevents page-level horizontal scroll
    }}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}        // FIX: pass live isMobile instead of reading window inline
      />

      {/* Main content */}
      <div style={{
        flex: 1,
        minWidth: 0,               // FIX: prevents flex child from overflowing sidebar
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 20px",  // FIX: 20px left so page title isn't clipped
            borderBottom: "1px solid #e5e7eb",
            background: "#fff",
            flexShrink: 0,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", display: "flex", alignItems: "center" }}>
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#111", display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={18} color="#22c55e" /> Admin
            </h1>
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("isAdmin") === "true"
  );

  const handleLogin = (email) => {
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminEmail", email);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    setLoggedIn(false);
  };

  return (
    <ContactsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={loggedIn ? <Navigate to="/" replace /> : <AdminLogin onLogin={handleLogin} />} />
          <Route path="/" element={loggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ContactsProvider>
  );
}