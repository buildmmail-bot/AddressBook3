import { Users, Phone, Mail, Pencil, Trash2, Search, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";


const Index = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/contacts/")
      .then((res) => res.json())
      .then((data) => setContacts(data));
  }, []);

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState("contact");
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", company_name: "", phones: [""], emails: [""], address: "",front_card: null, back_card: null,front_preview: null,back_preview: null});
  const [deleteId, setDeleteId] = useState(null);

  const filtered = contacts.filter((c) => {
    const emailStr = Array.isArray(c.emails)
      ? c.emails.join(" ")
      : (c.email || "");
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      emailStr.toLowerCase().includes(search.toLowerCase())
    );
  });

const handleAddContact = async () => {
const validPhones = (newForm.phones || []).filter(p => p.trim() !== "");
const validEmails = (newForm.emails || []).filter(e => e.trim() !== "");

if (validPhones.length === 0) {
  alert("At least one phone is required");
  return;
}
  const payload = { ...newForm, emails: validEmails };
  console.log("SENDING DATA:", payload);

  const formData = new FormData();
  formData.append("name", newForm.name);
  formData.append("company_name", newForm.company_name);
  formData.append("phones", JSON.stringify(newForm.phones.filter(p => p.trim() !== "")));
  formData.append("address", newForm.address);
 validEmails.forEach((email) => {
  formData.append("emails[]", email);
});
  if (newForm.front_card) formData.append("front_card", newForm.front_card);
  if (newForm.back_card)  formData.append("back_card",  newForm.back_card);

  const res = await fetch("http://127.0.0.1:8000/api/contacts/", {
    method: "POST",
    body: formData,   // ← no Content-Type header, browser sets it automatically
  });
  const saved = await res.json();
  const newContact = { ...payload, id: saved.id, online: false };
  setContacts((prev) => [...prev, newContact]);
  setNewForm({ name: "", company_name: "", phones: [""], emails: [""], address: "", front_card: null, back_card: null,front_preview: "",back_preview: ""});
  setIsAdding(false);
  setSelected(newContact);
  setForm(newContact);
};
 const handleSelect = (contact) => {
  setSelected(contact);
  setForm({
    ...contact,
    emails: contact.emails?.length
      ? contact.emails
      : [contact.email || ""]
  });
    setIsEditing(false);
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
    await fetch(`http://127.0.0.1:8000/api/contacts/${form.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setContacts((prev) => prev.map((c) => (c.id === form.id ? form : c)));
    setSelected(form);
    setIsEditing(false);
  };

  const initials = (name = "") => name.split(" ").map((n) => n[0]).join("");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif", background: "#f9fafb", color: "#1a1a2e" }}>

      {/* ===== ADD CONTACT MODAL ===== */}
      {isAdding && (
        <div
          onClick={() => setIsAdding(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 460,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              position: "relative",
              margin: "0 16px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111" }}>Add New Contact</h3>
              <button
                onClick={() => setIsAdding(false)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <EditField label="Name *"    value={newForm.name}         onChange={(v) => setNewForm({ ...newForm, name: v })} />
              <EditField label="Company *" value={newForm.company_name} onChange={(v) => setNewForm({ ...newForm, company_name: v })} />

              {/* ── Multi-Phone Fields ── */}
<div>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
    <label style={{ fontSize: 12, color: "#9ca3af" }}>Phone *</label>
    <button
      onClick={() => setNewForm({ ...newForm, phones: [...(newForm.phones || []), ""],  })}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        background: "#dcfce7", border: "none", borderRadius: 6,
        color: "#16a34a", fontSize: 12, fontWeight: 600,
        padding: "3px 10px", cursor: "pointer",
      }}
    >
      <Plus size={12} /> Add Phone
    </button>
  </div>
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {(newForm.phones || []).map((phone, idx) =>(
      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          value={phone}
          placeholder={idx === 0 ? "Primary phone *" : `Phone ${idx + 1}`}
          onChange={(e) => {
            const updated = [...newForm.phones];
            updated[idx] = e.target.value;
            setNewForm({ ...newForm, phones: updated });
          }}
          style={{
            flex: 1, padding: "6px 10px", fontSize: 15,
            border: "2px solid #a9ecb2", borderRadius: 6,
            outline: "none", background: "#fff", color: "#111",
            boxSizing: "border-box",
          }}
        />
             {(newForm.phones || []).length > 1 && (
          <button
            onClick={() => {
              const updated = (newForm.phones || []).filter((_, i) => i !== idx);
                setNewForm({ ...newForm, phones: updated });
            }}
            style={{
              background: "#fee2e2", border: "none", borderRadius: 6,
              width: 30, height: 30, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
          >
            <X size={14} color="#ef4444" />
          </button>
        )}
      </div>
    ))}
  </div>
</div>
              {/* ── Multi-Email Fields ── */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, color: "#9ca3af" }}>Email *</label>
                  <button
                    onClick={() => setNewForm({ ...newForm, emails: [...newForm.emails, ""] })}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      background: "#dcfce7", border: "none", borderRadius: 6,
                      color: "#16a34a", fontSize: 12, fontWeight: 600,
                      padding: "3px 10px", cursor: "pointer",
                    }}
                  >
                    <Plus size={12} /> Add Email
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {newForm.emails.map((email, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        value={email}
                        placeholder={idx === 0 ? "Primary email *" : `Email ${idx + 1}`}
                        onChange={(e) => {
                          const updated = [...newForm.emails];
                          updated[idx] = e.target.value;
                          setNewForm({ ...newForm, emails: updated });
                        }}
                        style={{
                          flex: 1, padding: "6px 10px", fontSize: 15,
                          border: "2px solid #a9ecb2", borderRadius: 6,
                          outline: "none", background: "#fff", color: "#111",
                          boxSizing: "border-box",
                        }}
                      />
                      {newForm.emails.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = newForm.emails.filter((_, i) => i !== idx);
                            setNewForm({ ...newForm, emails: updated });
                          }}
                          style={{
                            background: "#fee2e2", border: "none", borderRadius: 6,
                            width: 30, height: 30, display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", flexShrink: 0,
                          }}
                        >
                          <X size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <EditField label="Address *" value={newForm.address || ""} onChange={(v) => setNewForm({ ...newForm, address: v })} />
                {/* ── Front Card Upload ── */}
<div>
  <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>Upload Front Card</label>
  <label style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 6, padding: "18px 12px", border: "2px dashed #a9ecb2", borderRadius: 8,
    background: newForm.front_card ? "#f0fdf4" : "#fff", cursor: "pointer",
    transition: "background 0.2s",
  }}>
    <input
      type="file" accept="image/*" style={{ display: "none" }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) setNewForm({ ...newForm, front_card: file,front_preview: URL.createObjectURL(file) }); 
      }}
    />
    {newForm.front_card ? (
      <>
        <img
          src={newForm.front_preview}
          alt="Front Card"
          style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 6 }}
        />
        <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>✓ {newForm.front_card.name}</span>
      </>
    ) : (
      <>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={18} color="#16a34a" />
        </div>
        <span style={{ fontSize: 13, color: "#6b7280" }}>Click to upload <strong>Front Card</strong></span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>PNG, JPG </span>
      </>
    )}
  </label>
</div>

{/* ── Back Card Upload ── */}
<div>
  <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>Upload Back Card</label>
  <label style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 6, padding: "18px 12px", border: "2px dashed #a9ecb2", borderRadius: 8,
    background: newForm.back_card ? "#f0fdf4" : "#fff", cursor: "pointer",
    transition: "background 0.2s",
  }}>
    <input
      type="file" accept="image/*" style={{ display: "none" }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) setNewForm({ ...newForm, back_card: file,  back_preview: URL.createObjectURL(file), });
      }}
    />
    {newForm.back_card ? (
      <>
        <img
        src={newForm.back_preview}
          alt="Back Card"
          style={{ width: "100%", maxHeight: 100, objectFit: "cover", borderRadius: 6 }}
        />
        <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>✓ {newForm.back_card.name}</span>
      </>
    ) : (
      <>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={18} color="#16a34a" />
        </div>
        <span style={{ fontSize: 13, color: "#6b7280" }}>Click to upload <strong>Back Card</strong></span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>PNG, JPG </span>
      </>
    )}
  </label>
</div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => setIsAdding(false)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 8,
                    border: "none",
                    background: "#22c55e",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
  <div
  onClick={(e) => e.stopPropagation()}
  style={{
      position: "fixed",
      inset: 0,
      background: "#fff",
      padding: 24,
      borderRadius: 12,
      width: 320,
      // textAlign: "center",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
         zIndex: 9999,
       }}
>
  
   
  {/* ICON */}
  <div style={{ marginBottom: 12 }}>
    <Trash2 size={30} color="#ef4444" />
  </div>

  {/* TEXT */}
  <h3 style={{ marginBottom: 10 }}>Are you sure?</h3>

  <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
    This contact will be permanently deleted.
  </p>
  
 
  {/* BUTTONS */}
  <div style={{ display: "flex", gap: 10 }}>
    <button
      onClick={() => setDeleteId(null)}
      style={{
        flex: 1,
        padding: "8px 0",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      Cancel
    </button>

    <button
      onClick={() => {
        handleDelete(deleteId);
        setDeleteId(null);
      }}
      style={{
        flex: 1,
        padding: "8px 0",
        borderRadius: 8,
        border: "none",
        background: "#ef4444",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Delete
    </button>
  </div>
</div>
)} 

    


      {/* ===== CONTACT LIST ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>
            Counter:<span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 18 }}>({contacts.length})</span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: "1px solid #e5e7eb", borderRadius: 8, outline: "none", width: 220, background: "#fff" }}
              />
            </div>
            <button
              onClick={() => {
                setIsAdding(true);
                setSelected(null);
                setForm(null);
                setNewForm({ name: "", company_name: "", phones: [""], emails: [""], address: "" });
              }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              <Plus size={12} /> Add Contact
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 160px", padding: "8px 24px", fontSize: 11, fontWeight: 600, color: "#155d19", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #e5e7eb" }}>
          <span>Name</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Address</span>
           <span>Actions</span>
        </div>

        {/* Rows */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map((contact) => (
           <div
              key={contact.id}
              onClick={() => handleSelect(contact)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                alignItems: "center",
                width: "100%",
                padding: "12px 24px",
                border: "none",
                borderBottom: "2px solid #155d19",
                background: selected?.id === contact.id ? "#f0fdf4" : "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                    {initials(contact.name)}
                  </div>
                  {contact.online && (
                    <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#111" }}>{contact.name}</p>
                  <p style={{ fontSize: 12, margin: 0, color: "#9ca3af" }}>{contact.company_name}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
  {(contact.phones || [contact.phone]).map((ph, i) => (
    <span key={i} style={{ fontSize: 14, color: "#374151" }}>
      {ph}
    </span>
  ))}
</div>
              
            

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {(contact.emails || []).map((em, i) => (
              <span key={i} style={{ fontSize: 14, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {em}
            </span>
              ))}
            </div>
              <span style={{ fontSize: 14, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contact.address}</span>
              <div style={{ display: "flex", gap: 5 }} onClick={(e) => e.stopPropagation()}>

  {/* VIEW */}
  <button
    onClick={() => { handleSelect(contact); setIsEditing(false); }}
    style={{
      display: "flex", alignItems: "center", gap: 3,
      padding: "5px 8px", borderRadius: 6,
      border: "1px solid #a9ecb2", background: "#f0fdf4",
      cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#16a34a"
    }}
  >
    <Users size={11} /> View
  </button>

  {/* EDIT */}
  <button
    onClick={() => { handleSelect(contact); setIsEditing(true); }}
    style={{
      display: "flex", alignItems: "center", gap: 3,
      padding: "5px 8px", borderRadius: 6,
      border: "1px solid #e5e7eb", background: "#fff",
      cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#374151"
    }}
  >
    <Pencil size={11} /> Edit
  </button>

  {/* DELETE */}
  <button
  onClick={() => setDeleteId(contact.id)}
  style={{
    display: "flex",
    alignItems: "center",
    gap: 3,
    padding: "5px 8px",
    borderRadius: 6,
    border: "none",
    background: "#ef4444",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    color: "#fff"
  }}
>
 
  <Trash2 size={14} /> Delete
</button>

</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 32, fontSize: 14 }}>No contacts found.</p>
          )}
        </div>
      </div>

      {/* ===== DETAIL CARD ===== */}
      {selected && form && (
        <div style={{ width: 300, borderLeft: "2px solid #155d19", background: "#fff", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto" }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              onClick={() => { setSelected(null); setForm(null); setIsEditing(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ position: "relative", marginBottom: 8 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#1cc159", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600, color: "#ffffff" }}>
              {initials(selected.name)}
            </div>
            {selected.online && <span style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "3px solid #fff" }} />}
          </div>
          {selected.online && <span style={{ fontSize: 12, color: "#22c55e", marginBottom: 4 }}>Online</span>}
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: "4px 0 2px" }}>{selected.name}</h3>
          <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>{selected.company_name}</p>

          <div style={{ display: "flex", gap: 4, border: "1px solid #e5e7eb", borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {["contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px", fontSize: 13, borderRadius: 8, border: "none", cursor: "pointer",
                  textTransform: "capitalize", fontWeight: activeTab === tab ? 600 : 400,
                  background: activeTab === tab ? "#dcfce7" : "transparent",
                  color: activeTab === tab ? "#16a34a" : "#7e806bcf",
                  fontFamily: "inherit",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "contact" && !isEditing && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 1. Phone Number Row */}
    <InfoRow 
      icon={<Phone size={17} />} 
      label="Phone number" 
      value={selected.phone} 
    />

    {/* 2. Emails Loop */}
    {(selected.emails || []).map((em, i) => (
      <InfoRow
        key={i}
        icon={<Mail size={17} />}
        label={`Email ${i + 1}`}
        value={em}
      />
    ))}
              {/* <InfoRow   key={i}
    icon={<Mail size={17} />}
    label={`Email ${i + 1}`}
    value={em}
     icon={<Phone size={17} />} label="Phone number" value={selected.phone} />
  {(selected.emails || []).map((em, i) => (
  <InfoRow
    key={i}
    icon={<Mail size={17} />}
    label={`Email ${i + 1}`}
    value={em}
  /> */}
{/* ))} */}
            </div>
          )}

          {activeTab === "contact" && isEditing && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              <EditField label="Name"         value={form.name}            onChange={(v) => setForm({ ...form, name: v })} />
              <EditField label="Company_name" value={form.company_name}    onChange={(v) => setForm({ ...form, company_name: v })} />
              <EditField label="Phone"        value={form.phone}           onChange={(v) => { if (v.length <= 10) setForm({ ...form, phone: v }); }} />
 <div>
  {/* Header with + button */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
    <label style={{ fontSize: 12, color: "#9ca3af" }}>Emails</label>

    <button
      onClick={() =>
        setForm({ ...form, emails: [...(form.emails || []), ""] })
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "#dcfce7",
        border: "none",
        borderRadius: 6,
        color: "#16a34a",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        cursor: "pointer",
      }}
    >
      <Plus size={12} /> Add
    </button>
  </div>

  {/* Email Inputs */}
  {(form.emails || []).map((email, idx) => (
    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      
      <input
        value={email}
        placeholder={`Email ${idx + 1}`}
        onChange={(e) => {
          const updated = [...form.emails];
          updated[idx] = e.target.value;
          setForm({ ...form, emails: updated });
        }}
        style={{
          flex: 1,
          padding: "6px 10px",
          fontSize: 15,
          border: "2px solid #a9ecb2",
          borderRadius: 6,
          outline: "none",
        }}
      />

      {/* ❌ Remove button */}
      {(form.emails || []).length > 1 && (
        <button
          onClick={() => {
            const updated = form.emails.filter((_, i) => i !== idx);
            setForm({ ...form, emails: updated });
          }}
          style={{
            background: "#fee2e2",
            border: "none",
            borderRadius: 6,
            width: 30,
            height: 30,
            cursor: "pointer",
          }}
        >
          <X size={14} color="#ef4444" />
        </button>
      )}
    </div>
  ))}
</div>
              <EditField label="Address"      value={form.address || ""}   onChange={(v) => setForm({ ...form, address: v })} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={handleUpdate} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Save</button>
                <button onClick={() => { setForm(selected); setIsEditing(false); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {activeTab !== "contact" && (
            <p style={{ fontSize: 14, color: "#52aa3e" }}>No {activeTab} information available.</p>
          )}

          {!isEditing && (
            <div style={{ display: "flex", gap: 8, marginTop: 24, width: "100%" }}>
              {/* <button onClick={() => setIsEditing(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
                <Pencil size={14} /> Edit
              </button> */}
              {/* <button onClick={() => handleDelete(selected.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Trash2 size={14} /> Delete
              </button> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 500, margin: "2px 0 0", color: "#111" }}>{value}</p>
    </div>
    <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e", background: "#dcfce7" }}>
      {icon}
    </div>
  </div>
);

const EditField = ({ label, value, onChange }) => (
  <div>
    <label style={{ fontSize: 12, color: "#9ca3af" }}>{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "6px 10px", fontSize: 15, border: "2px solid #a9ecb2", borderRadius: 6, outline: "none", background: "#fff", color: "#111", boxSizing: "border-box" }}
    />
  </div>
);

export default Index;