import React, { useState, useEffect } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://uhanzkksmktlucmxevls.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYW56a2tzbWt0bHVjbXhldmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDMzOTcsImV4cCI6MjEwNzQ3OTM5N30.-wbrxlsladhQpVlcgwIZSr9P9wy6kP5ZT3wClDtfJAk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const [tab, setTab] = useState('trabajador');
  const [cargando, setCargando] = useState(true);

  // Obras base por defecto
  const obrasIniciales = {
    'LARAPA-01': { id: 'LARAPA-01', nombre: 'Obra Larapa 01 (Casa Residencial)', ubicacion: 'Sector Larapa #12', presupuestoTotal: 6500, montoRecibido: 0, porcentajeAvance: 0, avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 }, foto: null, finalizada: false, pagosDueno: [] },
    'LARAPA-02': { id: 'LARAPA-02', nombre: 'Obra Larapa 02 (Remodelación Eléctrica)', ubicacion: 'Sector Larapa #45', presupuestoTotal: 4200, montoRecibido: 0, porcentajeAvance: 0, avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 }, foto: null, finalizada: false, pagosDueno: [] },
    'ANDINA-01': { id: 'ANDINA-01', nombre: 'Obra Andina 01 (Cableado General)', ubicacion: 'Urbanización Andina B-4', presupuestoTotal: 8200, montoRecibido: 0, porcentajeAvance: 0, avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 }, foto: null, finalizada: false, pagosDueno: [] },
    'ANDINA-02': { id: 'ANDINA-02', nombre: 'Obra Andina 02 (Instalación Luminarias)', ubicacion: 'Urbanización Andina C-10', presupuestoTotal: 5100, montoRecibido: 0, porcentajeAvance: 0, avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 }, foto: null, finalizada: false, pagosDueno: [] },
    'SAYLLA-01': { id: 'SAYLLA-01', nombre: 'Obra Saylla 01 (Tableros Industriales)', ubicacion: 'Av. Principal Saylla #45', presupuestoTotal: 3800, montoRecibido: 0, porcentajeAvance: 0, avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 }, foto: null, finalizada: false, pagosDueno: [] }
  };

  const [obras, setObras] = useState(obrasIniciales);
  const [asistenciasGlobales, setAsistenciasGlobales] = useState({});
  const [historialPagosPersonal, setHistorialPagosPersonal] = useState([]);

  // CARGAR DATOS DIRECTAMENTE DESDE SUPABASE AL ABRIR LA APP
  const cargarDatosSupabase = async () => {
    setCargando(true);
    try {
      // 1. Cargar Obras desde Supabase
      const { data: dataObras, error: errObras } = await supabase.from('obras').select('*');
      if (!errObras && dataObras && dataObras.length > 0) {
        setObras((prev) => {
          const copia = { ...prev };
          dataObras.forEach((o) => {
            copia[o.id] = {
              id: o.id,
              nombre: o.nombre || copia[o.id]?.nombre || o.id,
              ubicacion: o.ubicacion || copia[o.id]?.ubicacion || '',
              presupuestoTotal: Number(o.presupuesto_total) || copia[o.id]?.presupuestoTotal || 0,
              montoRecibido: Number(o.monto_recibido) || 0,
              porcentajeAvance: Number(o.porcentaje_avance) || 0,
              avancesPorDia: o.avances_por_dia || copia[o.id]?.avancesPorDia || { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 },
              foto: o.foto || null,
              finalizada: o.finalizada || false,
              pagosDueno: copia[o.id]?.pagosDueno || []
            };
          });
          return copia;
        });
      }

      // 2. Cargar Asistencias desde Supabase
      const { data: dataAsis, error: errAsis } = await supabase.from('asistencias').select('*');
      if (!errAsis && dataAsis) {
        const mapaAsis = {};
        dataAsis.forEach((a) => {
          mapaAsis[a.trabajador] = {
            dias: a.dias || [],
            ultimaObra: a.obra_id || ''
          };
        });
        setAsistenciasGlobales(mapaAsis);
      }

      // 3. Cargar Pagos del Dueño desde Supabase
      const { data: dataPagos, error: errPagos } = await supabase.from('pagos_dueno').select('*');
      if (!errPagos && dataPagos) {
        setObras((prev) => {
          const copia = { ...prev };
          Object.keys(copia).forEach(id => { copia[id].pagosDueno = []; });
          dataPagos.forEach((p) => {
            if (copia[p.obra_id]) {
              copia[p.obra_id].pagosDueno.push({ fecha: p.fecha, monto: Number(p.monto) });
            }
          });
          return copia;
        });
      }
    } catch (e) {
      console.error("Error sincronizando con Supabase:", e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosSupabase();
  }, []);

  // Estados de formularios
  const [nombreTrabajador, setNombreTrabajador] = useState('');
  const [diaSemana, setDiaSemana] = useState('Lunes');
  const [obraSeleccionada, setObraSeleccionada] = useState('LARAPA-01');
  const [avanceInput, setAvanceInput] = useState('');
  const [fotoPreview, setFotoPreview] = useState(null);
  const [ticketAsistencia, setTicketAsistencia] = useState(null);

  const [codigoBuscar, setCodigoBuscar] = useState('');
  const [obraConsultadaId, setObraConsultadaId] = useState(null);
  const [montoPago, setMontoPago] = useState('');

  const [nombrePersonalPago, setNombrePersonalPago] = useState('');
  const [montoSueldoPago, setMontoSueldoPago] = useState('');

  const handleCargarFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = (evt) => {
        img.src = evt.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setFotoPreview(canvas.toDataURL('image/jpeg', 0.5));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // REGISTRAR TRABAJADOR Y GUARDAR EN NUBE EN TIEMPO REAL
  const handleRegistrarJornadaUnificada = async (e) => {
    e.preventDefault();
    const nombreClean = nombreTrabajador.trim();
    if (!nombreClean) {
      alert('Escribe el nombre del trabajador.');
      return;
    }

    const regPrevio = asistenciasGlobales[nombreClean] || { dias: [], ultimaObra: '' };
    const yaTieneAsistencia = regPrevio.dias.includes(diaSemana);
    const nuevosDias = yaTieneAsistencia ? regPrevio.dias : [...regPrevio.dias, diaSemana];

    // Actualizar pantalla
    setAsistenciasGlobales((prev) => ({
      ...prev,
      [nombreClean]: { dias: nuevosDias, ultimaObra: obraSeleccionada }
    }));

    // Sincronizar Asistencia con Supabase
    try {
      await supabase.from('asistencias').upsert({
        trabajador: nombreClean,
        obra_id: obraSeleccionada,
        dias: nuevosDias
      }, { onConflict: 'trabajador' });
    } catch(err) {
      console.error(err);
    }

    const incremento = parseInt(avanceInput) || 0;
    if (incremento > 0 || fotoPreview) {
      const obraPrev = obras[obraSeleccionada];
      const nuevosAvancesDia = {
        ...obraPrev.avancesPorDia,
        [diaSemana]: (obraPrev.avancesPorDia[diaSemana] || 0) + incremento
      };
      const nuevoTotalAvance = Math.min(100, Object.values(nuevosAvancesDia).reduce((a, b) => a + b, 0));
      const fotoGuardar = fotoPreview || obraPrev.foto;

      setObras((prev) => ({
        ...prev,
        [obraSeleccionada]: {
          ...obraPrev,
          porcentajeAvance: nuevoTotalAvance,
          avancesPorDia: nuevosAvancesDia,
          foto: fotoGuardar
        }
      }));

      // Sincronizar Obra con Supabase
      try {
        await supabase.from('obras').upsert({ 
          id: obraSeleccionada,
          nombre: obraPrev.nombre,
          ubicacion: obraPrev.ubicacion,
          presupuesto_total: obraPrev.presupuestoTotal,
          monto_recibido: obraPrev.montoRecibido,
          porcentaje_avance: nuevoTotalAvance,
          avances_por_dia: nuevosAvancesDia,
          foto: fotoGuardar,
          finalizada: obraPrev.finalizada
        });
      } catch(err) {
        console.error(err);
      }
    }

    setTicketAsistencia({
      trabajador: nombreClean,
      dia: diaSemana,
      totalDias: nuevosDias.length,
      porcentaje: Math.round((nuevosDias.length / 6) * 100),
      obra: obras[obraSeleccionada]?.nombre || obraSeleccionada,
      incremento
    });

    setNombreTrabajador('');
    setAvanceInput('');
    setFotoPreview(null);
  };

  const handleBuscarObraDueno = (e) => {
    e.preventDefault();
    const cod = codigoBuscar.trim().toUpperCase();
    if (obras[cod]) {
      setObraConsultadaId(cod);
    } else {
      alert('Código no encontrado. Prueba con: LARAPA-01, LARAPA-02, ANDINA-01, ANDINA-02 o SAYLLA-01');
      setObraConsultadaId(null);
    }
  };

  // REGISTRAR PAGO DEL DUEÑO Y GUARDAR EN NUBE
  const handleRealizarPagoDueno = async (e) => {
    e.preventDefault();
    const pago = parseFloat(montoPago);
    if (!pago || pago <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }

    const obraActual = obras[obraConsultadaId];
    const saldoPendiente = obraActual.presupuestoTotal - obraActual.montoRecibido;

    if (pago > saldoPendiente) {
      alert(`El monto excede el saldo pendiente (S/. ${saldoPendiente.toFixed(2)}).`);
      return;
    }

    const fechaActual = new Date().toLocaleDateString('es-PE');
    const nuevoTotalRecibido = obraActual.montoRecibido + pago;

    // Actualizar pantalla
    setObras((prev) => ({
      ...prev,
      [obraConsultadaId]: {
        ...prev[obraConsultadaId],
        montoRecibido: nuevoTotalRecibido,
        pagosDueno: [{ fecha: fechaActual, monto: pago }, ...prev[obraConsultadaId].pagosDueno]
      }
    }));

    // Sincronizar Pago con Supabase
    try {
      await supabase.from('obras').update({ monto_recibido: nuevoTotalRecibido }).eq('id', obraConsultadaId);
      await supabase.from('pagos_dueno').insert({ obra_id: obraConsultadaId, fecha: fechaActual, monto: pago });
    } catch(err) {
      console.error(err);
    }

    alert(`✓ Pago de S/. ${pago.toFixed(2)} guardado exitosamente en la base de datos.`);
    setMontoPago('');
  };

  const handlePagarPersonal = (e) => {
    e.preventDefault();
    const pago = parseFloat(montoSueldoPago);
    const nombreClean = nombrePersonalPago.trim();

    if (!nombreClean || !pago || pago <= 0) {
      alert('Ingresa el nombre del trabajador y un monto válido.');
      return;
    }

    const fechaActual = new Date().toLocaleDateString('es-PE');
    setHistorialPagosPersonal((prev) => [
      { trabajador: nombreClean, fecha: fechaActual, monto: pago },
      ...prev
    ]);

    alert(`✓ Pago de S/. ${pago.toFixed(2)} registrado para ${nombreClean}.`);
    setNombrePersonalPago('');
    setMontoSueldoPago('');
  };

  const handleReiniciarAsistenciasSemana = async () => {
    if (window.confirm('¿Deseas reiniciar las asistencias semanales a 0?')) {
      setAsistenciasGlobales({});
      try {
        await supabase.from('asistencias').delete().neq('trabajador', '');
      } catch(e){}
      alert('✓ Asistencias reiniciadas.');
    }
  };

  const handleFinalizarObra = async (idObra) => {
    if (window.confirm(`¿Confirmas que la obra ${idObra} ha sido finalizada?`)) {
      setObras((prev) => ({
        ...prev,
        [idObra]: { ...prev[idObra], finalizada: true, porcentajeAvance: 100 }
      }));
      try {
        await supabase.from('obras').update({ finalizada: true, porcentaje_avance: 100 }).eq('id', idObra);
      } catch(e){}
    }
  };

  const listaTrabajadoresGlobal = Object.entries(asistenciasGlobales).map(([nombre, item]) => ({
    nombre,
    diasAsistidos: item.dias.length,
    porcentaje: Math.round((item.dias.length / 6) * 100),
    obraNombre: obras[item.ultimaObra]?.nombre || item.ultimaObra
  }));

  const obraConsultada = obraConsultadaId ? obras[obraConsultadaId] : null;
  const obrasActivas = Object.values(obras).filter((o) => !o.finalizada);
  const obrasArchivadas = Object.values(obras).filter((o) => o.finalizada);
  const diasSemanaList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div style={{ maxWidth: '950px', margin: '20px auto', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      
      {/* ENCABEZADO */}
      <header style={{ background: '#329db8', color: '#fff', padding: '20px', borderRadius: '8px 8px 0 0', borderBottom: '4px solid #2563eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', margin: 0 }}>Sistema Control de Obras y Finanzas</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#d6e419' }}>
            {cargando ? '⌛ Conectando con Supabase...' : '🟢 Sincronizado en Vivo con la Nube'}
          </p>
        </div>
        <button onClick={cargarDatosSupabase} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
          🔄 Recargar Datos
        </button>
      </header>

      {/* NAVEGACIÓN */}
      <nav style={{ display: 'flex', background: '#e2e8f0' }}>
        <button onClick={() => setTab('trabajador')} style={{ flex: 1, padding: '14px', border: 'none', background: tab === 'trabajador' ? '#fff' : 'transparent', fontWeight: 'bold', color: tab === 'trabajador' ? '#2563eb' : '#64748b', cursor: 'pointer', borderBottom: tab === 'trabajador' ? '3px solid #2563eb' : 'none' }}>
          Módulo Trabajador
        </button>
        <button onClick={() => setTab('dueno')} style={{ flex: 1, padding: '14px', border: 'none', background: tab === 'dueno' ? '#fff' : 'transparent', fontWeight: 'bold', color: tab === 'dueno' ? '#2563eb' : '#64748b', cursor: 'pointer', borderBottom: tab === 'dueno' ? '3px solid #2563eb' : 'none' }}>
          Portal Dueño de Casa
        </button>
        <button onClick={() => setTab('gerente')} style={{ flex: 1, padding: '14px', border: 'none', background: tab === 'gerente' ? '#fff' : 'transparent', fontWeight: 'bold', color: tab === 'gerente' ? '#2563eb' : '#64748b', cursor: 'pointer', borderBottom: tab === 'gerente' ? '3px solid #2563eb' : 'none' }}>
          Panel Gerencial (Gerente)
        </button>
      </nav>

      {/* CONTENIDO */}
      <div style={{ background: '#fff', padding: '25px', border: '1px solid #cbd5e1', borderRadius: '0 0 8px 8px' }}>
        
        {/* 1. MÓDULO TRABAJADOR */}
        {tab === 'trabajador' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '15px' }}>Registro de Jornada de Trabajo</h2>
            <form onSubmit={handleRegistrarJornadaUnificada} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Nombre Trabajador:</label>
                  <input type="text" value={nombreTrabajador} onChange={(e) => setNombreTrabajador(e.target.value)} placeholder="Ej. Marco Silva" style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Día Trabajado:</label>
                  <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    {diasSemanaList.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Obra Asignada Hoy:</label>
                <select value={obraSeleccionada} onChange={(e) => setObraSeleccionada(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  {obrasActivas.map((o) => (<option key={o.id} value={o.id}>{o.nombre}</option>))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>% Avance Logrado Hoy (Opcional):</label>
                  <input type="number" value={avanceInput} onChange={(e) => setAvanceInput(e.target.value)} placeholder="Ej. 10" style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Foto Evidencia del Día:</label>
                  <input type="file" accept="image/*" onChange={handleCargarFoto} style={{ marginTop: '4px', display: 'block' }} />
                </div>
              </div>

              {fotoPreview && (
                <div style={{ marginBottom: '15px' }}>
                  <img src={fotoPreview} alt="Evidencia" style={{ maxHeight: '180px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              )}

              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                REGISTRAR DÍA DE TRABAJO Y AVANCE
              </button>

              {ticketAsistencia && (
                <div style={{ marginTop: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>✓ REGISTRO EXITOSO:</strong> <strong>{ticketAsistencia.trabajador}</strong> en el día <strong>{ticketAsistencia.dia}</strong> en <strong>{ticketAsistencia.obra}</strong>.
                  </p>
                </div>
              )}
            </form>
          </div>
        )}

        {/* 2. PORTAL DUEÑO DE CASA */}
        {tab === 'dueno' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '15px' }}>Portal Privado del Dueño de Casa</h2>
            <form onSubmit={handleBuscarObraDueno} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                Ingresa el código privado de tu propiedad (Ej. <strong>LARAPA-01</strong>, <strong>LARAPA-02</strong>, <strong>ANDINA-01</strong>):
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={codigoBuscar} onChange={(e) => setCodigoBuscar(e.target.value)} placeholder="LARAPA-01" style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>
                  CONSULTAR CASA
                </button>
              </div>
            </form>

            {obraConsultada && (
              <div style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>{obraConsultada.nombre}</h3>
                  {obraConsultada.finalizada && (
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>OBRA CONCLUIDA</span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 15px 0' }}>{obraConsultada.ubicacion}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                    <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 'bold', display: 'block' }}>PRESUPUESTO TOTAL:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0369a1' }}>S/. {obraConsultada.presupuestoTotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 'bold', display: 'block' }}>MONTO RECIBIDO:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#15803d' }}>S/. {obraConsultada.montoRecibido.toFixed(2)}</strong>
                  </div>
                  <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                    <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 'bold', display: 'block' }}>SALDO PENDIENTE:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#b45309' }}>
                      S/. {(obraConsultada.presupuestoTotal - obraConsultada.montoRecibido).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {!obraConsultada.finalizada && (
                  <div style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0f172a' }}>Abonar Cuota / Pago Adelantado</h4>
                    <form onSubmit={handleRealizarPagoDueno} style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '10px', fontWeight: 'bold', color: '#64748b' }}>S/.</span>
                        <input type="number" step="0.01" value={montoPago} onChange={(e) => setMontoPago(e.target.value)} placeholder="Monto a abonar" style={{ width: '100%', padding: '10px 10px 10px 35px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                      </div>
                      <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>
                        REGISTRAR ABONO
                      </button>
                    </form>
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <span>Avance Acumulado de Obra:</span>
                    <span style={{ color: '#2563eb' }}>{obraConsultada.porcentajeAvance}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '14px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ background: '#2563eb', height: '100%', width: `${obraConsultada.porcentajeAvance}%`, transition: 'width 0.4s' }}></div>
                  </div>
                </div>

                {obraConsultada.foto && (
                  <div style={{ marginBottom: '20px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#0f172a' }}>📷 Última Foto de Evidencia Guardada:</h4>
                    <img src={obraConsultada.foto} alt="Evidencia en vivo" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}

                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>Historial de Abonos Recibidos:</p>
                  {obraConsultada.pagosDueno.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Aún no se han registrado abonos.</p>
                  ) : (
                    <ul style={{ fontSize: '0.85rem', paddingLeft: '20px', color: '#334155', margin: 0 }}>
                      {obraConsultada.pagosDueno.map((p, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>Fecha {p.fecha}: <strong>S/. {p.monto.toFixed(2)}</strong></li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. PANEL GERENCIAL */}
        {tab === 'gerente' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '15px' }}>Panel de Control Gerencial</h2>

            <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginBottom: '25px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.95rem', margin: 0, color: '#0f172a' }}>📋 Asistencia Semanal por Trabajador</h3>
                <button onClick={handleReiniciarAsistenciasSemana} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>
                  Reiniciar Asistencias
                </button>
              </div>

              {listaTrabajadoresGlobal.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>No hay asistencias registradas.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#fff', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Trabajador</th>
                      <th style={{ padding: '8px' }}>Última Obra</th>
                      <th style={{ padding: '8px' }}>Días Asistidos</th>
                      <th style={{ padding: '8px' }}>% Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaTrabajadoresGlobal.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.nombre}</td>
                        <td style={{ padding: '8px', color: '#64748b' }}>{t.obraNombre}</td>
                        <td style={{ padding: '8px' }}>{t.diasAsistidos} / 6 días</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: t.porcentaje >= 80 ? '#16a34a' : '#d97706' }}>{t.porcentaje}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <form onSubmit={handlePagarPersonal} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', marginBottom: '25px', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 12px 0', color: '#0f172a' }}>Pagar Sueldo a Personal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Nombre Trabajador:</label>
                  <input type="text" value={nombrePersonalPago} onChange={(e) => setNombrePersonalPago(e.target.value)} placeholder="Ej. Marco Silva" style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Monto a Pagar (S/.):</label>
                  <input type="number" step="0.01" value={montoSueldoPago} onChange={(e) => setMontoSueldoPago(e.target.value)} placeholder="Ej. 350.00" style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
              </div>
              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                REGISTRAR PAGO A PERSONAL
              </button>
            </form>

            <h3 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Resumen General de Obras Activas</h3>
            <div style={{ overflowX: 'auto', marginBottom: '25px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Obra / Código</th>
                    <th style={{ padding: '10px' }}>Presupuesto Total</th>
                    <th style={{ padding: '10px' }}>Monto Recibido</th>
                    <th style={{ padding: '10px' }}>Saldo Pendiente</th>
                    <th style={{ padding: '10px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {obrasActivas.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '10px' }}><strong>{o.nombre}</strong><br /><code style={{ color: '#64748b' }}>{o.id}</code></td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#0369a1' }}>S/. {o.presupuestoTotal.toFixed(2)}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>S/. {o.montoRecibido.toFixed(2)}</td>
                      <td style={{ padding: '10px', color: '#b45309', fontWeight: 'bold' }}>S/. {(o.presupuestoTotal - o.montoRecibido).toFixed(2)}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => handleFinalizarObra(o.id)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                          Finalizar Obra
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
