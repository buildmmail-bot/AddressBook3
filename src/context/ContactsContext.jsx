import { createContext, useContext, useState, useEffect } from "react";

const ContactsContext = createContext();

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/contacts/")
      .then((res) => res.json())
      .then((data) => setContacts(data));
  }, []);

  const addContact = async (newForm) => {
    const res = await fetch("http://localhost:8000/api/contacts/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    const saved = await res.json();
    const newContact = { ...newForm, id: saved.id, online: false };
    setContacts((prev) => [...prev, newContact]);
    return newContact;
  };

  const updateContact = async (form) => {
    await fetch(`http://localhost:8000/api/contacts/${form.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setContacts((prev) => prev.map((c) => (c.id === form.id ? form : c)));
  };

  const deleteContact = async (id) => {
    await fetch(`http://localhost:8000/api/contacts/${id}/`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ContactsContext.Provider value={{ contacts, addContact, updateContact, deleteContact }}>
      {children}
    </ContactsContext.Provider>
  );
}

export const useContacts = () => useContext(ContactsContext);