import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Users, CreditCard, QrCode, UserPlus, X, LogOut } from "lucide-react";
import { ContactsProvider } from "./context/ContactsContext";
import ContactList from "./ContactList.jsx";
import UsersPage from "./pages/CardsPage.jsx";
import AdminLogin from "./Adminlogin.jsx";
import QRPage from "./pages/TotalLogin.jsx";

/* ── ADD ADMIN MODAL ── */
function AddAdminModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register-admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Admin added successfully!");
        // We don't necessarily want to log out the current admin just because they added a new one
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
          <X size={20} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 20 }}>Add New Admin</h2>
        {message && <p style={{ color: "#16a34a", background: "#dcfce7", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{message}</p>}
        {error && <p style={{ color: "#dc2626", background: "#fee2e2", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</p>}
        
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
function Sidebar({ activePage, setActivePage, onLogout }) {
  const [showModal, setShowModal] = useState(false);

  const navItem = (page, icon, label) => (
    <button
      onClick={() => setActivePage(page)}
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
      <aside style={{ width: 220, borderRight: "1px solid #e5e7eb", background: "#fff", padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: "#111" }}>
          <Users size={20} color="#22c55e" /> Admin
        </h1>
        {navItem("contacts", <Users size={16} />, "Contact List")}
        {navItem("cards", <CreditCard size={16} />, "Cards")}
        {navItem("qr", <QrCode size={16} />, "AdminList")}
        
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#16a34a", background: "#dcfce7", border: "none", cursor: "pointer", width: "100%" }}>
            <UserPlus size={16} /> Add Admin
          </button>
          
          <button onClick={onLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#dc2626", background: "#fee2e2", border: "none", cursor: "pointer", width: "100%" }}>
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

  const renderPage = () => {
    if (activePage === "contacts") return <ContactList />;
    if (activePage === "cards") return <UsersPage />;
    if (activePage === "qr") return <QRPage onGoToContacts={() => setActivePage("contacts")} />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif", background: "#f9fafb" }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
      <div style={{ flex: 1, overflow: "auto" }}>{renderPage()}</div>
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
          {/* Admin Login Route */}
          <Route 
            path="/admin" 
            element={loggedIn ? <Navigate to="/" replace /> : <AdminLogin onLogin={handleLogin} />} 
          />

          {/* Root Route: If logged in show Dashboard, else redirect to Login */}
          <Route 
            path="/" 
            element={loggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/admin" replace />} 
          />

          {/* Catch-all: Redirect unknown paths to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ContactsProvider>
  );
}