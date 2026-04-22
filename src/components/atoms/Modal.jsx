import React from "react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-0 relative animate-fade-in-up flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-main text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-bold mb-4 text-main px-6 pt-6">{title}</h2>}
        <div className="prose max-w-none overflow-y-auto max-h-[70vh] px-6">{children}</div>
        <div className="sticky bottom-0 left-0 w-full bg-white px-6 pb-4 pt-2 z-10 flex justify-end gap-2"></div>
      </div>
    </div>
  );
}
