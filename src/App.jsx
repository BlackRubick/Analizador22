import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "./components/atoms/Navbar";
import Layout from "./components/templates/Layout";
import Footer from "./components/atoms/Footer";
import PatientList from "./components/PatientList";
import PatientForm from "./components/PatientForm";
import AnalysisList from "./components/AnalysisList";
import AnalysisForm from "./components/AnalysisForm";
import PatientListView from "./components/organisms/PatientListView";
import AnalysisListView from "./components/organisms/AnalysisListView";
import PatientFormView from "./components/organisms/PatientFormView";
import AnalysisFormView from "./components/organisms/AnalysisFormView";
import Settings from "./components/Settings";


function loadPatients() {
  try {
    const data = localStorage.getItem("patients");
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

function savePatients(patients) {
  localStorage.setItem("patients", JSON.stringify(patients));
}

function App() {
  const [patients, setPatients] = useState(loadPatients());
  const [view, setView] = useState("patients");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingAnalysis, setEditingAnalysis] = useState(null);
  const [user, setUser] = useState({ nombre: "Usuario", email: "", preferencias: "" });

  useEffect(() => {
    savePatients(patients);
  }, [patients]);

  const handleAddAnalysis = () => {
    setEditingAnalysis(null);
    setView("analysisForm");
  };
  const handleEditAnalysis = (a) => {
    setEditingAnalysis(a);
    setView("analysisForm");
  };
  const handleDeleteAnalysis = (a) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar análisis?',
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
      if (result.isConfirmed) {
        setPatients(patients.map(pt => pt.id === selectedPatient.id ? { ...pt, analyses: pt.analyses.filter(an => an.id !== a.id) } : pt));
        Swal.fire({
          icon: 'success',
          title: '¡Análisis eliminado!',
          showConfirmButton: false,
          timer: 1200,
          customClass: { popup: '!rounded-xl' }
        });
      }
    });
  };
      const handleSaveAnalysis = (data) => {
        setPatients(patients.map(pt => {
          if (pt.id !== selectedPatient.id) return pt;
          if (editingAnalysis) {
            return { ...pt, analyses: pt.analyses.map(an => an.id === editingAnalysis.id ? { ...an, ...data } : an) };
          } else {
            return { ...pt, analyses: [...pt.analyses, { ...data, id: Date.now() }] };
          }
        }));
        setView("analysis");
      };
    const handleSelectPatient = (p) => {
      setSelectedPatient(p);
      setView("analysis");
    };


  const goToPatients = () => { setView("patients"); setSelectedPatient(null); setEditingPatient(null); };
  const goToSettings = () => setView("settings");
  const goToAnalysis = () => { if (selectedPatient) setView("analysis"); };
  const goToPatientForm = () => { setEditingPatient(null); setView("patientForm"); };
  const goToAnalysisForm = () => { setEditingAnalysis(null); setView("analysisForm"); };

  const handleAddPatient = () => { setEditingPatient(null); setView("patientForm"); };
  const handleEditPatient = (p) => { setEditingPatient(p); setView("patientForm"); };
  const handleDeletePatient = (p) => {
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
      if (result.isConfirmed) {
        setPatients(patients.filter(pt => pt.id !== p.id));
        Swal.fire({
          icon: 'success',
          title: '¡Paciente eliminado!',
          showConfirmButton: false,
          timer: 1200,
          customClass: { popup: '!rounded-xl' }
        });
      }
    });
  };
  const handleSavePatient = (data) => {
    if (editingPatient) {
      setPatients(patients.map(pt => pt.id === editingPatient.id ? { ...pt, ...data } : pt));
    } else {
      setPatients([...patients, { ...data, id: Date.now(), analyses: [] }]);
    }
    setView("patients");
  };


  return (
    <Layout>
      <Navbar
        view={view}
        goToPatients={goToPatients}
        goToPatientForm={goToPatientForm}
        goToAnalysis={goToAnalysis}
        selectedPatient={selectedPatient}
      />
      <main className="flex-1 flex flex-col justify-stretch max-w-4xl w-full mx-auto px-2 pb-12 animate-fade-in">
        {view === "patients" && (
          <PatientListView
            PatientList={PatientList}
            patients={patients}
            onSelect={handleSelectPatient}
            onAdd={handleAddPatient}
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
          />
        )}
        {view === "patientForm" && (
          <PatientFormView
            PatientForm={PatientForm}
            initial={editingPatient}
            onSave={handleSavePatient}
            onCancel={goToPatients}
          />
        )}
        {view === "analysis" && selectedPatient && (
          <AnalysisListView
            AnalysisList={AnalysisList}
            analyses={patients.find(pt => pt.id === selectedPatient.id)?.analyses || []}
            onAdd={handleAddAnalysis}
            onEdit={handleEditAnalysis}
            onDelete={handleDeleteAnalysis}
            selectedPatient={selectedPatient}
            goToPatients={goToPatients}
          />
        )}
        {view === "analysisForm" && selectedPatient && (
          <AnalysisFormView
            AnalysisForm={AnalysisForm}
            initial={editingAnalysis}
            onSave={handleSaveAnalysis}
            onCancel={() => setView("analysis")}
          />
        )}
      </main>
      <Footer />
    </Layout>
  );
}

export default App;
