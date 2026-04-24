import React, { useState, useRef } from "react";
import Swal from "sweetalert2";

export default function AnalysisForm({ initial, onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    tipoTest: "Podometría digital",
    fecha: initial?.fecha || today,
    completado: false,
    archivo: null,
    cameraDevice: "",
    podometriaImg: null,
    tibiofemoralFrontal: null,
    tibiofemoralSagital: null,
    miofascialFrontal: null,
    miofascialSagital: null,
    tomarFoto: false,
  });
  const [availableCameras, setAvailableCameras] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [pieLoading, setPieLoading] = useState(false);
  const [adaptiveC, setAdaptiveC] = useState(10);
  const [invertThreshold, setInvertThreshold] = useState(true);
  const [binarizationType, setBinarizationType] = useState('adaptive');
  const [fixedThreshold, setFixedThreshold] = useState(120);
  const [pieBinImg, setPieBinImg] = useState(null);
  const [pieDebugImg, setPieDebugImg] = useState(null);
  const [pieResult, setPieResult] = useState(null);
  const [analisisState, setAnalisisState] = useState({
    podometria: { result: null, debugImg: null, binImg: null, huella: null },
    frontal: { result: null, debugImg: null },
    sagital: { result: null, debugImg: null },
    miofascial: { result: null, debugImg: null }
  });

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setForm({ ...form, [name]: checked });
    else if (type === "file") {
      setForm({ ...form, [uploadKey]: files[0] });
      if (files[0]) {
        setPieLoading(true);
        setPieResult(null);
        const formData = new FormData();
        formData.append('file', files[0]);
        let endpoint = '';
        if (step === 0) endpoint = 'http://127.0.0.1:8000/analyze-foot/';
        if (step === 1) endpoint = 'http://127.0.0.1:8000/analyze-knee/frontal/';
        if (step === 2) endpoint = 'http://127.0.0.1:8000/analyze-knee/sagittal/';
        if (step === 3) endpoint = 'http://127.0.0.1:8000/analyze-muscle-chain/';
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (step === 0 && res.ok && data.metrics) {
            setAnalisisState(prev => {
              const newState = { ...prev };
              newState.podometria.result = [{
                pie: 'Único',
                tipo: data.metrics.classification,
                porcentajeX: data.metrics.plantar_index?.toFixed(2),
                X: data.metrics.x_width_cm?.toFixed(1) + ' cm',
                Y: data.metrics.y_width_cm?.toFixed(1) + ' cm',
                mf: '',
              }];
              if (data.images && data.images.annotated) newState.podometria.debugImg = data.images.annotated;
              return newState;
            });
            if (files[0] && typeof files[0] !== 'string') {
              const reader = new FileReader();
              reader.onload = (ev) => {
                setAnalisisState(s => ({
                  ...s,
                  podometria: {
                    ...s.podometria,
                    huella: ev.target.result
                  }
                }));
              };
              reader.readAsDataURL(files[0]);
            } else if (typeof files[0] === 'string') {
              setAnalisisState(s => ({
                ...s,
                podometria: {
                  ...s.podometria,
                  huella: files[0]
                }
              }));
            }
          }
          if (step === 1 && res.ok && data.metrics) {
            setAnalisisState(prev => {
              const newState = { ...prev };
              newState.frontal.result = {
                tipo: data.metrics.classification,
                angulo: data.metrics.knee_angle_deg?.toFixed(1) + '°',
                plano: data.metrics.plane,
              };
              if (data.images && data.images.annotated) newState.frontal.debugImg = data.images.annotated;
              return newState;
            });
          }
          if (step === 2 && res.ok && data.metrics) {
            setAnalisisState(prev => {
              const newState = { ...prev };
              newState.sagital.result = {
                tipo: data.metrics.classification,
                angulo: data.metrics.knee_angle_deg?.toFixed(1) + '°',
                plano: data.metrics.plane,
              };
              if (data.images && data.images.annotated) newState.sagital.debugImg = data.images.annotated;
              return newState;
            });
          }
          if (step === 3 && res.ok && (data.chain || data.explanation || data.rasgos)) {
            setAnalisisState(prev => {
              const newState = { ...prev };
              newState.miofascial.result = [{
                tipo: data.chain,
                explicacion: data.explanation,
                rasgos: data.rasgos,
              }];
              if (data.images && data.images.annotated) newState.miofascial.debugImg = data.images.annotated;
              return newState;
            });
          }
        } catch (e) {
        }
        setPieLoading(false);
      }
    } else setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 0) {
      setStep(1);
      setForm(f => ({ ...f, tipoTest: "Ángulo de tibiofemoral" }));
      setPieResult(null);
      setPieDebugImg(null);
      setPieBinImg(null);
      return;
    }
    if (step === 1) {
      setStep(2);
      setForm(f => ({ ...f, tibiofemoralFrontal: null }));
      setPieResult(null);
      setPieDebugImg(null);
      setPieBinImg(null);
      return;
    }
    if (step === 2) {
      setStep(3);
      setForm(f => ({ ...f, tipoTest: "Cadena miofascial causal" }));
      return;
    }
    if (step === 3) {
      if (!form.miofascialFrontal && !form.miofascialSagital) {
        Swal.fire({
          icon: 'warning',
          title: 'Falta imagen',
          text: 'Debes subir al menos una imagen (frontal o sagital) para continuar.',
        });
        return;
      }
      const analysisId = form.id || Date.now();
      onSave({ ...form, id: analysisId, pdfUrl: null });
      Swal.fire({
        icon: initial ? 'success' : 'success',
        title: initial ? 'Análisis editado' : 'Análisis creado',
        text: initial ? 'El análisis fue editado correctamente.' : 'El análisis fue creado correctamente.',
        timer: 1800,
        showConfirmButton: false
      });

      const analisis = [];
      if (analisisState.podometria.result) {
        const imagenes = [];
        if (analisisState.podometria.huella && typeof analisisState.podometria.huella === 'string') {
          imagenes.push({ titulo: 'Huella plantar', base64: analisisState.podometria.huella.replace(/^data:image\/\w+;base64,/, '') });
        }
        if (analisisState.podometria.binImg && typeof analisisState.podometria.binImg === 'string') {
          imagenes.push({ titulo: ' binarizado', base64: analisisState.podometria.binImg.replace(/^data:image\/\w+;base64,/, '') });
        }
        if (analisisState.podometria.debugImg && typeof analisisState.podometria.debugImg === 'string') {
          imagenes.push({ titulo: ' podometría', base64: analisisState.podometria.debugImg.replace(/^data:image\/\w+;base64,/, '') });
        }
        analisis.push({
          titulo: 'Podometría digital',
          explicacion: analisisState.podometria.result[0]?.tipo ? `Tipo de pie: ${analisisState.podometria.result[0].tipo}` : '',
          metricas: [
            analisisState.podometria.result[0]?.porcentajeX ? `Índice plantar: ${analisisState.podometria.result[0].porcentajeX}` : '',
            analisisState.podometria.result[0]?.X ? `Ancho X: ${analisisState.podometria.result[0].X}` : '',
            analisisState.podometria.result[0]?.Y ? `Ancho Y: ${analisisState.podometria.result[0].Y}` : ''
          ].filter(Boolean),
          imagenes
        });
      }

      if (analisisState.frontal.result) {
        const imagenes = [];
        if (analisisState.frontal.debugImg && typeof analisisState.frontal.debugImg === 'string') {
          imagenes.push({ titulo: 'Debug frontal', base64: analisisState.frontal.debugImg.replace(/^data:image\/\w+;base64,/, '') });
        }
        analisis.push({
          titulo: 'Ángulo tibiofemoral (frontal)',
          explicacion: analisisState.frontal.result.tipo || '',
          metricas: [analisisState.frontal.result.angulo ? `Ángulo: ${analisisState.frontal.result.angulo}` : ''].filter(Boolean),
          imagenes
        });
      }

      if (analisisState.sagital.result) {
        const imagenes = [];
        if (analisisState.sagital.debugImg && typeof analisisState.sagital.debugImg === 'string') {
          imagenes.push({ titulo: 'Debug sagital', base64: analisisState.sagital.debugImg.replace(/^data:image\/\w+;base64,/, '') });
        }
        analisis.push({
          titulo: 'Ángulo tibiofemoral (sagital)',
          explicacion: analisisState.sagital.result.tipo || '',
          metricas: [analisisState.sagital.result.angulo ? `Ángulo: ${analisisState.sagital.result.angulo}` : ''].filter(Boolean),
          imagenes
        });
      }

      if (analisisState.miofascial.result) {
        const tipoCadena = analisisState.miofascial.result[0]?.tipo || analisisState.miofascial.result[0]?.chain || '';
        analisis.push({
          titulo: 'Cadena miofascial',
          tipo: tipoCadena,
          explicacion: analisisState.miofascial.result[0]?.explicacion || '',
          metricas: analisisState.miofascial.result[0]?.rasgos || [],
          imagenes: [analisisState.miofascial.debugImg && typeof analisisState.miofascial.debugImg === 'string' ? { titulo: 'Debug miofascial', base64: analisisState.miofascial.debugImg.replace(/^data:image\/\w+;base64,/, '') } : null].filter(Boolean)
        });
      }

      const reportData = {
        paciente: {
          nombre: form.nombre || 'Paciente',
          fecha: form.fecha || new Date().toLocaleDateString(),
        },
        fecha: form.fecha || new Date().toLocaleDateString(),
        analisis
      };
      fetch('http://127.0.0.1:8000/generate-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })
        .then(res => res.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          let pacientes = JSON.parse(localStorage.getItem('patients') || '[]');
          pacientes = pacientes.map(pt => {
            if (pt.analyses && pt.analyses.length > 0) {
              return {
                ...pt,
                analyses: pt.analyses.map(an => an.id === analysisId ? { ...an, pdfUrl: url } : an)
              };
            }
            return pt;
          });
          localStorage.setItem('patients', JSON.stringify(pacientes));
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ReportePaciente.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const handleOpenCamera = async () => {
    if (!form.cameraDevice) return alert("Selecciona una cámara");
    setShowCamera(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: form.cameraDevice } },
      });
      setStream(mediaStream);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 100);
    } catch {
      alert("No se pudo acceder a la cámara");
      setShowCamera(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      setForm((f) => ({ ...f, [uploadKey]: blob }));
      setShowCamera(false);
    });
  };

  let stepTitle = "";
  let stepSubtitle = "";
  let uploadKey = "";
  if (step === 0) {
    stepTitle = initial ? "Editar Test" : "Podometría digital";
    stepSubtitle = "Captura de Podometría digital";
    uploadKey = "podometriaImg";
  } else if (step === 1) {
    stepTitle = "Ángulo de tibiofemoral (Frontal)";
    stepSubtitle = "Sube o toma la foto del ángulo frontal";
    uploadKey = "tibiofemoralFrontal";
  } else if (step === 2) {
    stepTitle = "Ángulo de tibiofemoral (Sagital)";
    stepSubtitle = "Sube o toma la foto del ángulo sagital";
    uploadKey = "tibiofemoralSagital";
  } else if (step === 3) {
    stepTitle = "Cadena miofascial causal";
    stepSubtitle = "Sube o toma la foto (frontal y/o sagital)";
    uploadKey = form.miofascialFrontal === null ? "miofascialFrontal" : "miofascialSagital";
  }

  return (
    <React.Fragment>
      <div style={{ minHeight: '100vh' }} className="flex items-center justify-center bg-bg-secondary">
      <style>{`
        .af-card {
          background: #fff;
          border-radius: 32px;
          box-shadow: 0 4px 16px -1px rgba(0,0,0,.10), 0 16px 60px -8px rgba(var(--af-primary-rgb, 59,108,248),.16);
          padding: 56px 48px;
          max-width: 700px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .af-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--color-primary, #3b6cf8), #7c9fff);
          border-radius: 22px 22px 0 0;
        }
        .af-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
        }
        .af-header-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, var(--color-primary, #3b6cf8), #7c9fff);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59,108,248,.3);
        }
        .af-header-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-main, #111827);
          letter-spacing: -.02em;
          line-height: 1.2;
        }
        .af-header-sub {
          font-size: .82rem;
          color: #6b7280;
          margin-top: 2px;
        }
        .af-section-label {
          font-size: .72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .af-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--color-bg-secondary, #f3f4f6);
          border-radius: 10px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 22px;
        }
        .af-tab {
          border: none;
          background: transparent;
          padding: 10px 14px;
          border-radius: 7px;
          font-family: inherit;
          font-size: .85rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all .2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .af-tab.active {
          background: #fff;
          color: var(--color-primary, #3b6cf8);
          font-weight: 600;
          box-shadow: 0 1px 6px rgba(0,0,0,.1);
        }
        .af-upload-zone {
          border: 2px dashed #e5e7eb;
          border-radius: 14px;
          padding: 30px 24px;
          text-align: center;
          cursor: pointer;
          transition: all .2s ease;
          position: relative;
          background: #f9fafb;
        }
        .af-upload-zone:hover {
          border-color: var(--color-primary, #3b6cf8);
          background: #f0f4ff;
        }
        .af-upload-zone input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }
        .af-upload-icon {
          width: 42px; height: 42px;
          background: #e8eeff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .af-upload-title { font-size: .9rem; font-weight: 600; color: var(--color-main, #111827); }
        .af-upload-hint { font-size: .78rem; color: #6b7280; margin-top: 3px; }
        .af-camera-section { display: flex; flex-direction: column; gap: 10px; }
        .af-select {
          width: 100%;
          border: 2px solid #e5e7eb;
          background: #f9fafb;
          padding: 11px 40px 11px 14px;
          border-radius: 8px;
          font-family: inherit;
          font-size: .88rem;
          color: var(--color-main, #111827);
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' fill='none' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          transition: border-color .2s;
        }
        .af-select:focus { border-color: var(--color-primary, #3b6cf8); }
        .af-btn {
          border: none;
          padding: 11px 20px;
          border-radius: 8px;
          font-family: inherit;
          font-size: .88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s ease;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .af-btn-ghost {
          background: #f3f4f6;
          color: var(--color-main, #111827);
          width: fit-content;
        }
        .af-btn-ghost:hover { background: #e5e7eb; }
        .af-btn-primary {
          background: var(--color-primary, #3b6cf8);
          color: #fff;
          box-shadow: 0 3px 12px rgba(59,108,248,.3);
        }
        .af-btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(59,108,248,.35);
        }
        .af-btn-primary:active { transform: translateY(0); }
        .af-btn-outline {
          background: transparent;
          border: 2px solid #e5e7eb;
          color: #6b7280;
        }
        .af-btn-outline:hover {
          border-color: var(--color-primary, #3b6cf8);
          color: var(--color-primary, #3b6cf8);
          background: #f0f4ff;
        }
        .af-btn-row {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #f3f4f6;
        }
        .af-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(4px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .af-modal-box {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          max-width: 420px;
          width: 100%;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
        }
        .af-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .af-modal-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-main, #111827);
        }
        .af-close-btn {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #f3f4f6;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 1rem;
          transition: background .15s;
        }
        .af-close-btn:hover { background: #e5e7eb; }
        .af-video {
          width: 100%;
          border-radius: 12px;
          background: #111;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
          margin-bottom: 16px;
        }
      `}</style>


      <div className="af-card">
        <div className="af-header">
          <div className="af-header-icon">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="af-header-title">{stepTitle}</div>
            <div className="af-header-sub">{stepSubtitle}</div>
          </div>
        </div>

        <p className="af-section-label">Método de captura</p>
        <div className="af-tabs">
          <button
            type="button"
            className={`af-tab ${!form.tomarFoto ? "active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, tomarFoto: false, [uploadKey]: null }))}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Subir imagen
          </button>
          <button
            type="button"
            className={`af-tab ${form.tomarFoto ? "active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, tomarFoto: true, [uploadKey]: null }))}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
            Tomar foto
          </button>
        </div>

        {step === 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontWeight: 500, color: '#3b6cf8' }}>
                  Tipo de binarización:
                  <select value={binarizationType} onChange={e => setBinarizationType(e.target.value)} style={{ marginLeft: 8 }}>
                    <option value="adaptive">Adaptativo</option>
                    <option value="fixed">Fijo</option>
                  </select>
                </label>
              </div>
              {binarizationType === 'adaptive' && (
                <div>
                  <label style={{ fontWeight: 500, color: '#3b6cf8' }}>
                    Sensibilidad (C):
                    <input
                      type="range"
                      min="-20"
                      max="30"
                      value={adaptiveC}
                      onChange={e => setAdaptiveC(Number(e.target.value))}
                      style={{ margin: '0 10px', verticalAlign: 'middle' }}
                    />
                    <span style={{ fontWeight: 700 }}>{adaptiveC}</span>
                  </label>

                </div>
              )}
              {binarizationType === 'fixed' && (
                <div>
                  <label style={{ fontWeight: 500, color: '#3b6cf8' }}>
                    Umbral fijo:
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={fixedThreshold}
                      onChange={e => setFixedThreshold(Number(e.target.value))}
                      style={{ margin: '0 10px', verticalAlign: 'middle' }}
                    />
                    <span style={{ fontWeight: 700 }}>{fixedThreshold}</span>
                  </label>
                  <span style={{ color: '#666', fontSize: 12, marginLeft: 8 }}>
                    (Ajusta según el color/filtro de la huella)
                  </span>
                </div>
              )}
              <div>
                <label style={{ fontWeight: 500, color: '#3b6cf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Invertir umbral
                  <input
                    type="checkbox"
                    checked={invertThreshold}
                    onChange={e => setInvertThreshold(e.target.checked)}
                    style={{ marginLeft: 6 }}
                  />
                </label>
                <span style={{ color: '#666', fontSize: 12 }}>
                  (Activarlo solo  si la huella sale clara sobre fondo oscuro)
                </span>
              </div>
            </div>
            {pieBinImg && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 500, color: '#333', marginBottom: 4 }}>Vista binarizada:</div>
                <img src={pieBinImg} alt="Debug binarizado" style={{ maxWidth: 320, border: '2px solid #16a085', borderRadius: 8 }} />
              </div>
            )}
          </div>
        )}

        {!form.tomarFoto && (
          <div className="af-upload-zone">
            <input
              key={uploadKey}
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            <div className="af-upload-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="var(--color-primary,#3b6cf8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="af-upload-title">
              {form[uploadKey] ? "Imagen seleccionada ✓" : "Haz clic o arrastra aquí"}
            </p>
            <p className="af-upload-hint">PNG, JPG, WEBP — máx. 10 MB</p>
            <div style={{ marginTop: 12 }}>
              {pieLoading && (step === 0 || step === 1 || step === 2) && <span style={{ color: '#3b6cf8', fontWeight: 600 }}>
                {step === 0 ? 'Analizando tipo de pie...' : step === 1 ? 'Analizando ángulo de rodilla (frontal)...' : 'Analizando ángulo de rodilla (sagital)...'}
              </span>}
              {pieResult && Array.isArray(pieResult) && pieResult.length > 0 && (
                <div style={{ color: '#10b981', fontWeight: 600, marginBottom: 8 }}>
                  {pieResult.map((r, i) => (
                    step === 3 ? (
                      <div key={i} style={{ marginBottom: 10, color: '#3b6cf8' }}>
                        <b>Cadena detectada:</b> {r.tipo}<br/>
                        <b>Explicación:</b> {r.explicacion}<br/>
                        {r.rasgos && Array.isArray(r.rasgos) && r.rasgos.length > 0 && (
                          <ul style={{ color: '#222', fontWeight: 400, marginTop: 6 }}>
                            {r.rasgos.map((rasgo, idx) => (
                              <li key={idx}>• {rasgo}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : r.pie ? (
                      <div key={i} style={{ marginBottom: 6, color: r.pie === 'Izquierdo' ? '#3b6cf8' : '#f39c12' }}>
                        <b>{r.pie}:</b> Tipo: {r.tipo}, %X: {r.porcentajeX}
                        {r.X !== undefined && r.Y !== undefined && r.mf !== undefined && (
                          <span style={{ color: '#222', fontWeight: 400 }}>
                            &nbsp;| X: {r.X} px, Y: {r.Y} px, mf: {r.mf} px
                          </span>
                        )}
                      </div>
                    ) : r.advertencia ? (
                      <div key={i} style={{ color: '#e67e22', fontWeight: 700, marginBottom: 8 }}>
                        ⚠️ {r.advertencia}
                      </div>
                    ) : (
                      <div key={i} style={{ marginBottom: 6, color: '#3b6cf8' }}>
                        <b>{r.plano === 'frontal' ? 'Ángulo tibiofemoral (frontal):' : r.plano === 'sagittal' ? 'Ángulo tibiofemoral (sagital):' : ''}</b> {r.tipo} {r.angulo ? `| Ángulo: ${r.angulo}` : ''}
                      </div>
                    )
                  ))}
                </div>
              )}
              {pieDebugImg && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 500, color: '#333', marginBottom: 4 }}>Debug visual:</div>
                  <img src={pieDebugImg} alt={step === 0 ? 'Debug pie' : step === 1 ? 'Debug rodilla frontal' : step === 2 ? 'Debug rodilla sagital' : 'Debug miofascial'} style={{ maxWidth: 320, border: '2px solid #3b6cf8', borderRadius: 8 }} />
                </div>
              )}
            </div>
          </div>
        )}

        {form.tomarFoto && (
          <div className="af-camera-section">
            <select
              className="af-select"
              name="cameraDevice"
              value={form.cameraDevice || ""}
              onChange={handleChange}
            >
              <option value="">— Selecciona una cámara —</option>
              {availableCameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Cámara ${cam.deviceId}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="af-btn af-btn-ghost"
              onClick={async () => {
                if (!navigator.mediaDevices?.enumerateDevices) return;
                const devices = await navigator.mediaDevices.enumerateDevices();
                setAvailableCameras(devices.filter((d) => d.kind === "videoinput"));
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Actualizar cámaras
            </button>

            <button type="button" className="af-btn af-btn-primary" onClick={handleOpenCamera} style={{ alignSelf: "flex-start" }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="2" />
              </svg>
              Abrir cámara
            </button>

            {form[uploadKey] && (
              <p style={{ fontSize: ".82rem", color: "var(--color-success, #10b981)", fontWeight: 600 }}>
                ✓ Foto capturada correctamente
              </p>
            )}
          </div>
        )}

        <div className="af-btn-row">
          <button
            type="button"
            className="af-btn af-btn-outline"
            style={{ marginRight: 8 }}
            onClick={() => {
              if (step > 0) {
                setStep(prev => Math.max(prev - 1, 0));
                setPieResult(null);
                setPieDebugImg(null);
                setPieBinImg(null);
              }
            }}
            tabIndex={step === 0 ? -1 : 0}
            aria-disabled={step === 0}
            disabled={step === 0}
          >
            ← Atrás
          </button>
          <button type="button" className="af-btn af-btn-outline" onClick={() => {
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
          }}>
            Cancelar
          </button>
          <button
            type="button"
            className="af-btn af-btn-primary"
            onClick={handleSubmit}
            disabled={
              (step === 0 && !form.podometriaImg) ||
              (step === 1 && !form.tibiofemoralFrontal) ||
              (step === 2 && !form.tibiofemoralSagital) ||
              (step === 3 && !form.miofascialFrontal && !form.miofascialSagital)
            }
          >
            {step < 3 ? "Guardar y continuar" : "Guardar análisis"}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    {showCamera && (
        <div className="af-modal-overlay">
          <div className="af-modal-box">
            <div className="af-modal-header">
              <h3>Vista previa de cámara</h3>
              <button
                className="af-close-btn"
                onClick={() => { setShowCamera(false); stopStream(); }}
              >
                ✕
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline className="af-video" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <button className="af-btn af-btn-primary" onClick={handleCapture} style={{ width: "100%", justifyContent: "center" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="#fff" />
              </svg>
              Capturar foto
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}