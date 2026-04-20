import React from "react";
import Swal from "sweetalert2";

export default function PatientList({ patients, onSelect, onAdd, onEdit, onDelete }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-main tracking-tight">Pacientes</h2>
        <button className="btn-primary flex items-center gap-2" onClick={onAdd}>
          <span className="text-lg">➕</span> Registrar Paciente
        </button>
      </div>
      {patients.length === 0 ? (
        <div className="text-center p-8 text-secondary card">No hay pacientes registrados.</div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2">
          {patients.map((p) => (
            <div
              key={p.id}
              className="card cursor-pointer group transition-all duration-200"
              onClick={() => onSelect(p)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-main group-hover:text-primary transition">{p.nombre}</span>
                <span className="ml-auto text-xs bg-secondary text-main px-2 py-0.5 rounded-btn border border-secondary/40">{p.sexo}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-secondary text-sm mb-4">
                <span>Edad: <b className="text-main font-semibold">{p.edad}</b></span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="btn-secondary text-sm"
                  onClick={e => {e.stopPropagation(); onEdit(p);}}
                >Editar</button>
                <button
                  className="btn-secondary text-sm border-error text-error hover:bg-error hover:text-white hover:border-error"
                  onClick={e => {
                    e.stopPropagation();
                    Swal.fire({
                      icon: 'warning',
                      title: '¿Eliminar paciente?',
                      text: 'Esta acción no se puede deshacer.',
                      showCancelButton: true,
                      confirmButtonText: 'Sí, eliminar',
                      cancelButtonText: 'No',
                      reverseButtons: true,
                      customClass: {
                        confirmButton: 'swal2-confirm !bg-red-600 !text-white !rounded-md !shadow-md !transition !duration-150 !border-none !hover:bg-red-700 !focus:bg-red-700',
                        cancelButton: 'swal2-cancel btn-secondary'
                      },
                      buttonsStyling: false
                    }).then(result => {
                      if (result.isConfirmed) onDelete(p);
                    });
                  }}
                >Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
