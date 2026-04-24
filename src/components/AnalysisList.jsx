
import React, { useState } from "react";
import Swal from "sweetalert2";
import Modal from "./atoms/Modal";


export default function AnalysisList({ analyses, onAdd, onEdit, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [comment, setComment] = useState("");

  // Cargar comentario desde localStorage
  const getComment = (id) => {
    const comments = JSON.parse(localStorage.getItem("analysisComments") || "{}")
    return comments[id] || "";
  };

  // Guardar comentario en localStorage
  const saveComment = (id, text) => {
    const comments = JSON.parse(localStorage.getItem("analysisComments") || "{}")
    comments[id] = text;
    localStorage.setItem("analysisComments", JSON.stringify(comments));
  };

  const handleOpenModal = (analysis) => {
    setSelectedAnalysis(analysis);
    setComment(getComment(analysis.id));
    setModalOpen(true);
  };

  const handleSaveComment = () => {
    if (selectedAnalysis) {
      saveComment(selectedAnalysis.id, comment);
      setModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Observación guardada",
        timer: 1200,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-main tracking-tight">Historial de Análisis</h2>
        <button className="btn-primary flex items-center gap-2" onClick={onAdd}>
          <span className="text-lg"></span> Nuevo Test
        </button>
      </div>
      {analyses.length === 0 ? (
        <div className="text-center p-8 text-secondary card">No hay análisis registrados.</div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="card group transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-main group-hover:text-primary transition">{a.tipoTest}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-secondary text-sm mb-4">
                <span>Fecha: <b className="text-main font-semibold">{a.fecha}</b></span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="btn-secondary text-sm"
                  onClick={() => onEdit(a)}
                >Editar</button>
                <button
                  className="btn-secondary text-sm border-error text-error hover:bg-error hover:text-white hover:border-error"
                  onClick={() => onDelete(a)}
                >Eliminar</button>
                <button
                  className="btn-secondary text-sm border-info text-info hover:bg-info hover:text-white hover:border-info"
                  onClick={() => handleOpenModal(a)}
                >Observaciones</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Observaciones */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Observaciones del análisis">
        {selectedAnalysis && (
          <div className="flex flex-col gap-4">
            <div>
              <b>Tipo de test:</b> {selectedAnalysis.tipoTest}<br />
              <b>Fecha:</b> {selectedAnalysis.fecha}
            </div>
            <label className="font-semibold">Observaciones:</label>
            <textarea
              className="w-full border rounded p-2 min-h-[80px]"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Agrega aquí tus observaciones o comentarios sobre este análisis..."
            />
            <div className="flex gap-2 justify-end mt-2">
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cerrar</button>
              <button className="btn-primary" onClick={handleSaveComment}>Guardar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
