import React from "react";

export default function Navbar({ view, goToPatients, goToPatientForm, goToAnalysis, selectedPatient }) {
  return (
    <nav className="bg-white/90 shadow-lg backdrop-blur sticky top-0 z-20 animate-fade-in border-b border-blue-100">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goToPatients}>
          <img src="/images/logonegro.jpeg" alt="Logo" style={{ height: 40, width: 40, objectFit: 'contain' }} />
          <span className="font-extrabold text-xl tracking-tight text-blue-700">Nexo postural: Kyene’is Pondyam</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 hover:bg-blue-50 ${view === 'patients' ? 'bg-blue-100 text-blue-700' : 'text-blue-700/80'}`} onClick={goToPatients}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
            Pacientes
          </button>
          <button className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 hover:bg-blue-50 ${view === 'patientForm' ? 'bg-blue-100 text-blue-700' : 'text-blue-700/80'}`} onClick={goToPatientForm}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2563eb"/><path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            Registrar Paciente
          </button>
          <button className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 hover:bg-blue-50 ${view === 'analysis' ? 'bg-blue-100 text-blue-700' : 'text-blue-700/80'}`} onClick={goToAnalysis} disabled={!selectedPatient}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#2563eb"/><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            Análisis
          </button>
        </div>
      </div>
    </nav>
  );
}
