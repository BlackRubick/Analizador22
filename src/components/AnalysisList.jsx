import React from "react";
import Swal from "sweetalert2";

export default function AnalysisList({ analyses, onAdd, onEdit, onDelete }) {


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

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
