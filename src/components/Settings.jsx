import React, { useState } from "react";

export default function Settings({ user, onSave }) {
  const [form, setForm] = useState(user || { nombre: "", email: "", preferencias: "" });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form
      className="card max-w-lg mx-auto animate-fade-in"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-extrabold mb-6 text-main tracking-tight flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="var(--color-primary)"/><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        Configuración
      </h2>
      <div className="mb-4">
        <label className="block mb-1 text-main font-semibold">Nombre</label>
        <input className="w-full border-2 border-bg-secondary focus:border-primary p-3 rounded-btn transition-all outline-none bg-bg-secondary" name="nombre" value={form.nombre} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-main font-semibold">Email</label>
        <input className="w-full border-2 border-bg-secondary focus:border-primary p-3 rounded-btn transition-all outline-none bg-bg-secondary" name="email" value={form.email} onChange={handleChange} type="email" />
      </div>
      <div className="mb-8">
        <label className="block mb-1 text-main font-semibold">Preferencias</label>
        <textarea className="w-full border-2 border-bg-secondary focus:border-primary p-3 rounded-btn transition-all outline-none bg-bg-secondary min-h-[80px]" name="preferencias" value={form.preferencias} onChange={handleChange} />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="submit" className="btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}
