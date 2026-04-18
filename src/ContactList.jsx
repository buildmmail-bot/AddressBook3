import { Users, Phone, Mail, Pencil, Trash2, Search, Plus, X, MapPin, QrCode } from "lucide-react";
import { useState, useEffect } from "react";

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div>{icon}</div>
    <div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#111" }}>{value}</div>
    </div>
  </div>
);

const EditField = ({ label, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 15, color: "#16501b" }}>{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "8px 10px", fontSize: 15, border: "2px solid #a9ecb2",
        borderRadius: 6, outline: "none", background: "#fff", color: "#111",
        boxSizing: "border-box", width: "100%",
      }}
    />
  </div>
);

const Index = () => {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [activeTab, setActiveTab] = useState("contact");
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", company_name: "", phones: [""], emails: [""], address: "", front_card: null, back_card: null, front_preview: null, back_preview: null, qr_code: null, qr_preview: null });
  const [deleteId, setDeleteId] = useState(null);
  const [warningMsg, setWarningMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    fetch("http://localhost:8000/api/contacts/")
      .then((res) => res.json())
      .then((data) => setContacts(data));
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtered = contacts.filter((c) => {
    const emailStr = Array.isArray(c.emails) ? c.emails.join(" ") : (c.email || "");
    const phoneStr = Array.isArray(c.phones) ? c.phones.join(" ") : (c.phone || "");
    const searchTerm = (search || "").toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(searchTerm) ||
      (c.company_name || "").toLowerCase().includes(searchTerm) ||
      emailStr.toLowerCase().includes(searchTerm) ||
      phoneStr.toLowerCase().includes(searchTerm)
    );
  });

  const handleAddContact = async () => {
    const validPhones = (newForm.phones || []).filter(p => p.trim() !== "");
    const validEmails = (newForm.emails || []).filter(e => e.trim() !== "");
    if (validPhones.length === 0) { setWarningMsg("At least one phone number is required."); return; }
    for (let phone of validPhones) {
      if (!/^\d{10}$/.test(phone.trim())) { setWarningMsg(`Invalid phone: "${phone}" — must be exactly 10 digits.`); return; }
    }
    for (let email of validEmails) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setWarningMsg(`Invalid email: "${email}" — must be like example@gmail.com`); return; }
    }
    const formData = new FormData();
    formData.append("name", newForm.name);
    formData.append("company_name", newForm.company_name);
    formData.append("phones", JSON.stringify(validPhones));
    formData.append("address", newForm.address);
    validEmails.forEach((email) => { formData.append("emails[]", email); });
    if (newForm.front_card) formData.append("front_card", newForm.front_card);
    if (newForm.back_card) formData.append("back_card", newForm.back_card);
    if (newForm.qr_code) formData.append("qr_code", newForm.qr_code);
    const res = await fetch("http://127.0.0.1:8000/api/contacts/", { method: "POST", body: formData });
    const saved = await res.json();
    const newContact = { ...newForm, emails: validEmails, phones: validPhones, id: saved.id, online: false };
    setContacts((prev) => [...prev, newContact]);
    setNewForm({ name: "", company_name: "", phones: [""], emails: [""], address: "", front_card: null, back_card: null, front_preview: "", back_preview: "", qr_code: null, qr_preview: null });
    setIsAdding(false);
    setSuccessMsg("Contact added successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSelect = (contact) => {
    setSelected(contact);
    setForm({
      ...contact,
      emails: contact.emails?.length ? contact.emails : [contact.email || ""],
      phones: contact.phones?.length ? contact.phones : [contact.phone || ""],
    });
    setActiveTab("contact");
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/contacts/${id}/`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
    setForm(null);
  };

  const handleUpdate = async () => {
    if (!form) return;
    const contactId = form.id || form.pk || form._id;
    if (!contactId) { setWarningMsg("Cannot update: This contact has no ID."); return; }
    const cleanedPhones = (form.phones || []).map(p => typeof p === "object" ? p.phone : p).filter(p => p && p.trim() !== "");
    const cleanedEmails = (form.emails || []).map(e => typeof e === "object" ? e.email : e).filter(e => e && e.trim() !== "");
    for (let phone of cleanedPhones) {
      if (!/^\d{10}$/.test(phone.trim())) { setWarningMsg(`Invalid phone: "${phone}" — must be exactly 10 digits.`); return; }
    }
    for (let email of cleanedEmails) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setWarningMsg(`Invalid email: "${email}" — must be like example@gmail.com`); return; }
    }
    try {
      const cleanedForm = { ...form, phones: cleanedPhones, emails: cleanedEmails };
      const response = await fetch(`http://127.0.0.1:8000/api/contacts/${contactId}/`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanedForm),
      });
      if (response.ok) {
        const updatedContact = await response.json();
        setContacts(contacts.map(c => (c.id === contactId ? updatedContact : c)));
        setIsEditing(false);
        setSelected(null);
        setForm(null);
      } else {
        const err = await response.json();
        setWarningMsg("Failed to update: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      setWarningMsg("An error occurred while saving.");
    }
  };

  const initials = (name = "") => name.split(" ").map((n) => n[0]).join("");

  /* shared overlay + modal styles */
  const overlayStyle = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(4px)", display: "flex",
    alignItems: "center", justifyContent: "center",
    zIndex: 99999, padding: "16px",
  };

  return (
    <>
      {/* ── Root: width 100%, no overflow so it never slides under the sidebar ── */}
      <div style={{
        display: "flex",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
        fontFamily: "'Inter', sans-serif",
        background: "#f9fafb",
        color: "#1a1a2e",
      }}>

        {/* WARNING MODAL */}
        {warningMsg && (
          <div onClick={() => setWarningMsg(null)} style={overlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 32, borderRadius: 16, width: "100%", maxWidth: 340, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span style={{ fontSize: 28 }}>⚠️</span>
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#111" }}>Invalid Input</h3>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>{warningMsg}</p>
              <button onClick={() => setWarningMsg(null)} style={{ padding: "10px 32px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>OK</button>
            </div>
          </div>
        )}

        {/* SUCCESS MODAL */}
        {successMsg && (
          <div style={overlayStyle}>
            <div style={{ background: "#fff", padding: 32, borderRadius: 16, width: "100%", maxWidth: 320, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span style={{ fontSize: 28 }}>✅</span>
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#111" }}>Success!</h3>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>{successMsg}</p>
              <button onClick={() => setSuccessMsg(null)} style={{ padding: "10px 32px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>OK</button>
            </div>
          </div>
        )}

        {/* ADD CONTACT MODAL */}
        {isAdding && (
          <div onClick={() => setIsAdding(false)} style={{ ...overlayStyle, backdropFilter: "blur(6px)", zIndex: 1000 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: isMobile ? "20px 16px" : 32, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#111" }}>Add New Contact</h3>
                <button onClick={() => setIsAdding(false)} style={{ background: "#f3f4f6", border: "none", cursor: "pointer", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <EditField label="Name *" value={newForm.name || ""} onChange={(v) => setNewForm({ ...newForm, name: v })} />
                <EditField label="Company *" value={newForm.company_name || ""} onChange={(v) => setNewForm({ ...newForm, company_name: v })} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 14, color: "#000000" }}>Phone *</label>
                    <button onClick={() => setNewForm({ ...newForm, phones: [...(newForm.phones || []), ""] })} style={{ display: "flex", alignItems: "center", gap: 4, background: "#dcfce7", border: "none", borderRadius: 6, color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "3px 10px", cursor: "pointer" }}>
                      <Plus size={12} /> Add Phone
                    </button>
                  </div>
                  {(newForm.phones || []).map((phone, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <input value={phone} placeholder={idx === 0 ? "Primary phone *" : `Phone ${idx + 1}`} onChange={(e) => { const updated = [...newForm.phones]; updated[idx] = e.target.value; setNewForm({ ...newForm, phones: updated }); }} style={{ flex: 1, padding: "6px 10px", fontSize: 15, border: "2px solid #a9ecb2", borderRadius: 6, outline: "none", background: "#fff", color: "#111", boxSizing: "border-box" }} />
                      {(newForm.phones || []).length > 1 && (
                        <button onClick={() => setNewForm({ ...newForm, phones: (newForm.phones || []).filter((_, i) => i !== idx) })} style={{ background: "#fee2e2", border: "none", borderRadius: 6, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <X size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 14, color: "#000000" }}>Email *</label>
                    <button onClick={() => setNewForm({ ...newForm, emails: [...newForm.emails, ""] })} style={{ display: "flex", alignItems: "center", gap: 4, background: "#dcfce7", border: "none", borderRadius: 6, color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "3px 10px", cursor: "pointer" }}>
                      <Plus size={12} /> Add Email
                    </button>
                  </div>
                  {newForm.emails.map((email, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <input value={email} placeholder={idx === 0 ? "Primary email *" : `Email ${idx + 1}`} onChange={(e) => { const updated = [...newForm.emails]; updated[idx] = e.target.value; setNewForm({ ...newForm, emails: updated }); }} style={{ flex: 1, padding: "6px 10px", fontSize: 15, border: "2px solid #a9ecb2", borderRadius: 6, outline: "none", background: "#fff", color: "#111", boxSizing: "border-box" }} />
                      {newForm.emails.length > 1 && (
                        <button onClick={() => setNewForm({ ...newForm, emails: newForm.emails.filter((_, i) => i !== idx) })} style={{ background: "#fee2e2", border: "none", borderRadius: 6, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <X size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <EditField label="Address *" value={newForm.address || ""} onChange={(v) => setNewForm({ ...newForm, address: v })} />
                {/* Front Card */}
                <div>
                  <label style={{ fontSize: 14, color: "#000000", display: "block", marginBottom: 6 }}>Upload Front Card</label>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "18px 12px", border: "2px dashed #a9ecb2", borderRadius: 8, background: newForm.front_card ? "#f0fdf4" : "#fff", cursor: "pointer" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) setNewForm({ ...newForm, front_card: file, front_preview: URL.createObjectURL(file) }); }} />
                    {newForm.front_card ? (<><img src={newForm.front_preview} alt="Front" style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 6 }} /><span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>✓ {newForm.front_card.name}</span></>) : (<><div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={18} color="#16a34a" /></div><span style={{ fontSize: 13, color: "#6b7280" }}>Click to upload <strong>Front Card</strong></span></>)}
                  </label>
                </div>
                {/* Back Card */}
                <div>
                  <label style={{ fontSize: 14, color: "#000000", display: "block", marginBottom: 6 }}>Upload Back Card</label>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "18px 12px", border: "2px dashed #a9ecb2", borderRadius: 8, background: newForm.back_card ? "#f0fdf4" : "#fff", cursor: "pointer" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) setNewForm({ ...newForm, back_card: file, back_preview: URL.createObjectURL(file) }); }} />
                    {newForm.back_card ? (<><img src={newForm.back_preview} alt="Back" style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 6 }} /><span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>✓ {newForm.back_card.name}</span></>) : (<><div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={18} color="#16a34a" /></div><span style={{ fontSize: 13, color: "#6b7280" }}>Click to upload <strong>Back Card</strong></span></>)}
                  </label>
                </div>
                {/* QR Code */}
                <div>
                  <label style={{ fontSize: 14, color: "#000000", display: "block", marginBottom: 6 }}>Upload QR Code <span style={{ fontSize: 12, color: "#9ca3af" }}>(Optional)</span></label>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "18px 12px", border: "2px dashed #a9ecb2", borderRadius: 8, background: newForm.qr_code ? "#f0fdf4" : "#fff", cursor: "pointer" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) setNewForm({ ...newForm, qr_code: file, qr_preview: URL.createObjectURL(file) }); }} />
                    {newForm.qr_code ? (<><img src={newForm.qr_preview} alt="QR" style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 6 }} /><span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>✓ {newForm.qr_code.name}</span></>) : (<><div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}><QrCode size={18} color="#16a34a" /></div><span style={{ fontSize: 13, color: "#6b7280" }}>Click to upload <strong>QR Code</strong></span></>)}
                  </label>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={() => setIsAdding(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleAddContact} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Add Contact</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteId && (
          <div onClick={() => setDeleteId(null)} style={overlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 24, borderRadius: 12, width: "100%", maxWidth: 320, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ marginBottom: 12 }}><Trash2 size={30} color="#ef4444" /></div>
              <h3 style={{ marginBottom: 10 }}>Are you sure?</h3>
              <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 20 }}>This contact will be permanently deleted.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTACT LIST ── */}
        {/* FIX: minWidth:0 prevents this flex child from overflowing the sidebar */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>

          {/* Top bar — FIX: paddingLeft bumped to 20px on mobile */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: isMobile ? "12px 20px" : "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            flexWrap: "wrap", gap: 8,
            background: "#fff",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, whiteSpace: "nowrap" }}>
              Counter:<span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 16 }}>({contacts.length})</span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    fontSize: 14, border: "1px solid #e5e7eb", borderRadius: 8,
                    outline: "none", width: isMobile ? 150 : 220, background: "#fff",
                  }}
                />
              </div>
              <button
                onClick={() => { setIsAdding(true); setSelected(null); setForm(null); setNewForm({ name: "", company_name: "", phones: [""], emails: [""], address: "", qr_code: null, qr_preview: null }); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                <Plus size={12} /> {isMobile ? "" : "Add Contact"}
              </button>
            </div>
          </div>

          {/* Table header — desktop only */}
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 160px", padding: "8px 24px", fontSize: 11, fontWeight: 600, color: "#155d19", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #e5e7eb" }}>
              <span>Name</span><span>Phone</span><span>Email</span><span>Address</span><span>Actions</span>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((contact, index) => (
              isMobile ? (
                <div key={contact.id || index} onClick={() => { handleSelect(contact); setIsEditing(false); }} style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: selected?.id === contact.id ? "#f0fdf4" : "transparent", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", flexShrink: 0 }}>
                        {contact.name ? contact.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#174c1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{contact.name || "Unnamed"}</p>
                        <p style={{ fontSize: 12, margin: 0, color: "#9ca3af" }}>{contact.company_name || ""}</p>
                        <p style={{ fontSize: 12, margin: 0, color: "#374151" }}>{contact.phones?.[0]?.phone || contact.phones?.[0] || "No Phone"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { handleSelect(contact); setIsEditing(false); }} style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #a9ecb2", background: "#f0fdf4", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#16a34a" }}>
                        <Users size={11} />
                      </button>
                      <button onClick={() => { handleSelect(contact); setIsEditing(true); }} style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 11, color: "#000" }}>
                        <Pencil size={10} />
                      </button>
                      <button onClick={() => setDeleteId(contact.id)} style={{ padding: "5px 8px", borderRadius: 6, border: "none", background: "#ef4444", cursor: "pointer" }}>
                        <Trash2 size={11} color="#fff" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={contact.id || index} onClick={() => { handleSelect(contact); setIsEditing(false); }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", alignItems: "center", width: "100%", padding: "12px 24px", borderBottom: "2px solid #155d19", background: selected?.id === contact.id ? "#f0fdf4" : "transparent", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                      {contact.name ? contact.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p style={{ fontSize: 17, fontWeight: 500, margin: 0, color: "#174c1a" }}>{contact.name || "Unnamed"}</p>
                      <p style={{ fontSize: 12, margin: 0, color: "#9ca3af" }}>{contact.company_name || ""}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {contact.phones && contact.phones.length > 0 ? contact.phones.map((ph, i) => <span key={i} style={{ fontSize: 14, color: "#000000" }}>{ph.phone || ph}</span>) : <span style={{ fontSize: 15, color: "#bd4646" }}>No Phone</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {contact.emails && contact.emails.length > 0 ? contact.emails.map((em, i) => <span key={i} style={{ fontSize: 14, color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{em.email || em}</span>) : <span style={{ fontSize: 15, color: "#bd4646" }}>No Email</span>}
                  </div>
                  <span style={{ fontSize: 14, color: contact.address ? "#000000" : "#bd4646", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contact.address || "No Address"}</span>
                  <div style={{ display: "flex", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { handleSelect(contact); setIsEditing(false); }} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 8px", borderRadius: 6, border: "1px solid #a9ecb2", background: "#f0fdf4", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#16a34a" }}>
                      <Users size={11} /> View
                    </button>
                    <button onClick={() => { handleSelect(contact); setIsEditing(true); }} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#000000" }}>
                      <Pencil size={10} /> Edit
                    </button>
                    <button onClick={() => setDeleteId(contact.id)} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 8px", borderRadius: 6, border: "none", background: "#ef4444", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#fff" }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              )
            ))}
            {filtered.length === 0 && <p style={{ textAlign: "center", color: "#9ca3af", padding: 32, fontSize: 14 }}>No contacts found.</p>}
          </div>
        </div>
      </div>

      {/* VIEW / EDIT MODAL */}
      {selected && form && (
        <div style={{ ...overlayStyle, background: "rgba(0,0,0,0.5)" }}>
          <div style={{ width: "100%", maxWidth: 460, background: "#fff", padding: isMobile ? 20 : 32, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", maxHeight: "90vh", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{isEditing ? "Edit Contact" : "View Contact"}</h3>
              <button onClick={() => { setSelected(null); setForm(null); setIsEditing(false); }} style={{ background: "#f3f4f6", border: "none", cursor: "pointer", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 10, flexShrink: 0 }}>
              {initials(selected.name)}
            </div>
            <h3 style={{ margin: "4px 0 2px" }}>{selected.name}</h3>
            <p style={{ color: "#0e0f0f", marginBottom: 16 }}>{selected.company_name}</p>

            {!isEditing && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                {[["Name", selected.name], ["Company", selected.company_name], ["Address", selected.address]].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 16, color: "#228032" }}>{label}</label>
                    <div style={{ padding: "10px 12px", fontSize: 15, border: "1px solid #000000", borderRadius: 6, background: "#f9fafb", color: "#111" }}>{val || "—"}</div>
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 16, color: "#228032" }}>Phone</label>
                  {(selected.phones || []).map((ph, i) => (
                    <div key={i} style={{ padding: "10px 12px", fontSize: 15, border: "1px solid #000000", borderRadius: 6, background: "#f9fafb", color: "#111" }}>{ph.phone || ph}</div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 16, color: "#228032" }}>Email</label>
                  {(selected.emails || []).map((em, i) => (
                    <div key={i} style={{ padding: "10px 12px", fontSize: 15, border: "1px solid #000000", borderRadius: 6, background: "#f9fafb", color: "#111", wordBreak: "break-all" }}>{em.email || em}</div>
                  ))}
                </div>
                {selected.qr_code && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 16, color: "#228032" }}>QR Code</label>
                    <div style={{ padding: 10, border: "2px solid #a9ecb2", borderRadius: 6, background: "#f9fafb", display: "flex", justifyContent: "center" }}>
                      <img src={`http://127.0.0.1:8000${selected.qr_code}`} alt="QR Code" style={{ width: 160, height: 160, objectFit: "contain", borderRadius: 6 }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
                <EditField label="Name *" value={form.name || ""} onChange={(v) => setForm({ ...form, name: v })} />
                <EditField label="Company *" value={form.company_name || ""} onChange={(v) => setForm({ ...form, company_name: v })} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 15, color: "#235a16" }}>Phone *</label>
                    <button onClick={() => setForm({ ...form, phones: [...(form.phones || []), ""] })} style={{ display: "flex", alignItems: "center", gap: 4, background: "#dcfce7", border: "none", borderRadius: 6, color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "3px 10px", cursor: "pointer" }}>
                      <Plus size={12} /> Add Phone
                    </button>
                  </div>
                  {(form.phones || [""]).map((phone, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <input value={phone.phone || phone} placeholder={idx === 0 ? "Primary phone *" : `Phone ${idx + 1}`} onChange={(e) => { const updated = [...(form.phones || [""])]; updated[idx] = e.target.value; setForm({ ...form, phones: updated }); }} style={{ flex: 1, padding: "6px 10px", fontSize: 15, border: "2px solid #a9ecb2", borderRadius: 6, outline: "none", background: "#fff", color: "#0e0c0c", boxSizing: "border-box" }} />
                      {(form.phones || []).length > 1 && (
                        <button onClick={() => setForm({ ...form, phones: form.phones.filter((_, i) => i !== idx) })} style={{ background: "#fee2e2", border: "none", borderRadius: 6, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <X size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 15, color: "#235a16" }}>Email *</label>
                    <button onClick={() => setForm({ ...form, emails: [...(form.emails || []), ""] })} style={{ display: "flex", alignItems: "center", gap: 4, background: "#dcfce7", border: "none", borderRadius: 6, color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "3px 10px", cursor: "pointer" }}>
                      <Plus size={12} /> Add Email
                    </button>
                  </div>
                  {(form.emails || [""]).map((email, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <input value={email.email || email} placeholder={idx === 0 ? "Primary email *" : `Email ${idx + 1}`} onChange={(e) => { const updated = [...(form.emails || [""])]; updated[idx] = e.target.value; setForm({ ...form, emails: updated }); }} style={{ flex: 1, padding: "6px 10px", fontSize: 15, border: "2px solid #a9ecb2", borderRadius: 6, outline: "none", background: "#fff", color: "#111", boxSizing: "border-box" }} />
                      {(form.emails || []).length > 1 && (
                        <button onClick={() => setForm({ ...form, emails: form.emails.filter((_, i) => i !== idx) })} style={{ background: "#fee2e2", border: "none", borderRadius: 6, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <X size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <EditField label="Address *" value={form.address || ""} onChange={(v) => setForm({ ...form, address: v })} />
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={() => { setForm(selected); setIsEditing(false); }} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleUpdate} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Index;