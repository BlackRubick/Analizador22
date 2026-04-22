import React, { useState } from "react";
import Modal from "./atoms/Modal";
import Swal from "sweetalert2";

export default function PatientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial ? { ...initial } : { nombre: "", edad: "", sexo: "" }
  );
  const [consent, setConsent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!consent) return;
    onSave(form);
    Swal.fire({
      icon: initial ? 'success' : 'success',
      title: initial ? 'Paciente editado' : 'Paciente registrado',
      text: initial ? 'El paciente fue editado correctamente.' : 'El paciente fue registrado correctamente.',
      timer: 1800,
      showConfirmButton: false
    });
  };

  return (
    <>
      <form
        className="card max-w-lg mx-auto animate-fade-in"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-extrabold mb-6 text-main tracking-tight flex items-center gap-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="var(--color-primary)"/><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          {initial ? "Editar Paciente" : "Registrar Paciente"}
        </h2>
        <div className="mb-4">
          <label className="block mb-1 text-main font-semibold">Nombre</label>
          <input className="w-full border-2 border-bg-secondary focus:border-primary p-3 rounded-btn transition-all outline-none bg-bg-secondary" name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-main font-semibold">Edad</label>
          <input className="w-full border-2 border-bg-secondary focus:border-primary p-3 rounded-btn transition-all outline-none bg-bg-secondary" name="edad" value={form.edad} onChange={handleChange} required type="number" min="0" />
        </div>
        <div className="mb-8">
          <label className="block mb-1 text-main font-semibold">Sexo</label>
          <select className="w-full border-2 border-bg-secondary focus:border-primary p-3 rounded-btn transition-all outline-none bg-bg-secondary" name="sexo" value={form.sexo} onChange={handleChange} required>
            <option value="">Selecciona</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-primary w-5 h-5"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              required
            />
            <span className="text-main text-sm">
              He leído y acepto los
              <button
                type="button"
                className="underline text-primary font-semibold ml-1 hover:text-main focus:outline-none"
                onClick={() => setModalOpen(true)}
              >
                términos y condiciones
              </button>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-8">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              Swal.fire({
                icon: 'warning',
                title: '¿Cancelar?',
                text: '¿Seguro que quieres cancelar? Los cambios no se guardarán.',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No',
                reverseButtons: true
              }).then(result => {
                if (result.isConfirmed) onCancel();
              });
            }}
          >Cancelar</button>
          <button
            type="submit"
            className="btn-primary !bg-[var(--color-primary)] !text-white"
            disabled={
              !consent ||
              !form.nombre.trim() ||
              !form.edad ||
              !form.sexo
            }
          >{initial ? "Guardar" : "Registrar"}</button>
        </div>
      </form>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Carta de Consentimiento Informado y Aviso de Privacidad"
      >
        <div className="text-center text-gray-700 mb-4">
          <div className="font-semibold">Proyecto: NEXO-POSTURAL: Kyene’is Pøndyam.</div>
          <div>Lugar y fecha de emisión: <span className="font-mono">00/00/0000 Tuxtla Gutiérrez, Chiapas.</span></div>
        </div>
        <div className="prose prose-sm max-w-none text-gray-800 mb-4">
          <h3 className="font-bold text-gray-900 mt-6 mb-2">I. IDENTIDAD Y DOMICILIO DEL RESPONSABLE</h3>
          <p>El proyecto NEXO-POSTURAL, bajo la responsabilidad de Liliana Ruiz Alvarado y Ángel Enrique Patricio López, con domicilio en la Universidad Politécnica de Chiapas, es responsable del uso, tratamiento y protección de sus datos personales.</p>
          <h3 className="font-bold text-gray-900 mt-6 mb-2">II. DATOS PERSONALES Y SENSIBLES SOMETIDOS A TRATAMIENTO</h3>
          <p>Para cumplir con las finalidades de este análisis, se recabarán los siguientes datos personales: nombre completo, fecha de nacimiento, sexo, estatura y peso. Asimismo, se informa que se tratarán datos personales sensibles que requieren protección especial:</p>
          <ul className="list-disc ml-6">
            <li><span className="font-semibold">Imágenes Biométricas:</span> Registro fotográfico y de video para la detección de puntos anatómicos corporales.</li>
            <li><span className="font-semibold">Información de Salud:</span> Antecedentes médicos y diagnósticos derivados del estudio.</li>
          </ul>
          <h3 className="font-bold text-gray-900 mt-6 mb-2">III. FINALIDAD DEL TRATAMIENTO</h3>
          <p>Los datos recabados serán utilizados exclusivamente para fines de investigación, análisis postural y generación de diagnósticos médicos relacionados con el proyecto NEXO-POSTURAL.</p>
          <h3 className="font-bold text-gray-900 mt-6 mb-2">IV. DERECHOS ARCO Y CONFIDENCIALIDAD</h3>
          <p>Usted tiene derecho a conocer qué datos tenemos de usted, solicitar correcciones o la cancelación de los mismos (Derechos ARCO). Sin embargo, se hace de su conocimiento que por disposición de la NOM-004-SSA3-2012, los expedientes clínicos deben ser conservados por un periodo mínimo de 5 años tras el último acto médico. Sus datos personales no serán divulgados y, en caso de usarse para fines de investigación o docencia, se garantiza que no podrá ser identificado.</p>
          <h3 className="font-bold text-gray-900 mt-6 mb-2">V. DECLARACIÓN DE CONSENTIMIENTO</h3>
          <p>Por medio de la presente, autorizo al personal de NEXO-POSTURAL para la realización de los diagnósticos biomecánicos anteriormente descritos. He sido informado sobre los riesgos mínimos y los beneficios esperados de este análisis para mi salud postural. Otorgo mi consentimiento expreso para el tratamiento de mis datos personales y sensibles conforme a este aviso.</p>
        </div>
      </Modal>
    </>
  );
}
