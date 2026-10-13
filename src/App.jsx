import React, { useState, useEffect } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Conexión con tu base de datos Supabase
const SUPABASE_URL = 'https://uhanzkksmktlucmxevls.supabase.co';
const SUPABASE_KEY = 'sb_publishable_44AbuuHbYKcPWNlT9VlXUw_u4-bb'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const [tab, setTab] = useState('trabajador');

  // Base de Datos de Obras (Inician en 0%)
  const [obras, setObras] = useState({
    'LARAPA-01': {
      id: 'LARAPA-01',
      nombre: 'Obra Larapa 01 (Casa Residencial)',
      ubicacion: 'Sector Larapa #12',
      presupuestoTotal: 6500,
      montoRecibido: 0,
      porcentajeAvance: 0,
      avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 },
      foto: null,
      finalizada: false,
      asistencias: {
        'Edu Flores': ['Lunes', 'Miércoles', 'Viernes'],
        'Marco Silva': ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      },
      pagosDueno: []
    },
    'LARAPA-02': {
      id: 'LARAPA-02',
      nombre: 'Obra Larapa 02 (Remodelación Eléctrica)',
      ubicacion: 'Sector Larapa #45',
      presupuestoTotal: 4200,
      montoRecibido: 0,
      porcentajeAvance: 0,
      avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 },
      foto: null,
      finalizada: false,
      asistencias: {},
      pagosDueno: []
    },
    'ANDINA-01': {
      id: 'ANDINA-01',
      nombre: 'Obra Andina 01 (Cableado General)',
      ubicacion: 'Urbanización Andina B-4',
      presupuestoTotal: 8200,
      montoRecibido: 0,
      porcentajeAvance: 0,
      avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 },
      foto: null,
      finalizada: false,
      asistencias: {
        'Julio Torres': ['Lunes', 'Martes', 'Jueves']
      },
      pagosDueno: []
    },
    'ANDINA-02': {
      id: 'ANDINA-02',
      nombre: 'Obra Andina 02 (Instalación Luminarias)',
      ubicacion: 'Urbanización Andina C-10',
      presupuestoTotal: 5100,
      montoRecibido: 0,
      porcentajeAvance: 0,
      avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 },
      foto: null,
      finalizada: false,
      asistencias: {},
      pagosDueno: []
    },
    'SAYLLA-01': {
      id: 'SAYLLA-01',
      nombre: 'Obra Saylla 01 (Tableros Industriales)',
      ubicacion: 'Av. Principal Saylla #45',
      presupuestoTotal: 3800,
      montoRecibido: 0,
      porcentajeAvance: 0,
      avancesPorDia: { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 },
      foto: null,
      finalizada: false,
      asistencias: {},
      pagosDueno: []
    }
  });

  // Cargar datos automáticamente desde Supabase
  useEffect(() => {
    const cargarDatosSupabase = async () => {
      try {
        const { data: dataObras } = await supabase.from('obras').select('*');
        if (dataObras && dataObras.length > 0) {
          const obrasMap = {};
          dataObras.forEach((o) => {
            obrasMap[o.id] = {
              id: o.id,
              nombre: o.nombre,
              ubicacion: o.ubicacion,
              presupuestoTotal: Number(o.presupuesto_total) || 0,
              montoRecibido: Number(o.monto_recibido) || 0,
              porcentajeAvance: Number(o.porcentaje_avance) || 0,
              avancesPorDia: o.avances_por_dia || { 'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sábado': 0 },
              finalizada: o.finalizada || false,
              foto: null,
              asistencias: {},
              pagosDueno: []
            };
          });

          // Cargar Asistencias
          const { data: dataAsis } = await supabase.from('asistencias').select('*');
          if (dataAsis) {
            dataAsis.forEach((a) => {
              if (obrasMap[a.obra_id]) {
                obrasMap[a.obra_id].asistencias[a.trabajador] = a.dias || [];
              }
            });
          }

          // Cargar Pagos
          const { data: dataPagos } = await supabase.from('pagos_dueno').select('*');
          if (dataPagos) {
            dataPagos.forEach((p) => {
              if (obrasMap[p.obra_id]) {
                obrasMap[p.obra_id].pagosDueno.push({ fecha: p.fecha, monto: Number(p.monto) });
              }
            });
          }

          setObras(obrasMap);
        }
      } catch (e) {
        console.error("Error al sincronizar con Supabase:", e);
      }
    };
    cargarDatosSupabase();
  }, []);

  // Historial de pagos directos al personal
  const [historialPagosPersonal, setHistorialPagosPersonal] = useState([]);

  // Formulario Trabajador
  const [nombreTrabajador, setNombreTrabajador] = useState('');
  const [diaSemana, setDiaSemana] = useState('Lunes');
  const [obraSeleccionada, setObraSeleccionada] = useState('LARAPA-01');
  const [avanceInput, setAvanceInput] = useState('');
  const [fotoPreview, setFotoPreview] = useState(null);
  const [ticketAsistencia, setTicketAsistencia] = useState(null);

  // Portal Dueño
  const [codigoBuscar, setCodigoBuscar] = useState('');
  const [obraConsultadaId, setObraConsultadaId] = useState(null);
  const [montoPago, setMontoPago] = useState('');

  // Panel Gerencial
  const [nombrePersonalPago, setNombrePersonalPago] = useState('');
  const [montoSueldoPago, setMontoSueldoPago] = useState('');

  // 1. REGISTRAR ASISTENCIA TRABAJADOR
  const handleRegistrarAsistencia = (e) => {
    e.preventDefault();
    const nombreClean = nombreTrabajador.trim();
    if (!nombreClean) {
      alert('Escribe el nombre del trabajador.');
      return;
    }

    setObras((prev) => {
      const obraPrev = prev[obraSeleccionada];
      const asistenciasObra = { ...obraPrev.asistencias };
      const diasRegistrados = asistenciasObra[nombreClean] || [];

      if (diasRegistrados.includes(diaSemana)) {
        alert(`El trabajador ${nombreClean} ya tiene asistencia marcada para el ${diaSemana}.`);
        return prev;
      }

      const nuevosDias = [...diasRegistrados, diaSemana];
      asistenciasObra[nombreClean] = nuevosDias;
      const porcentajeAcumulado = Math.round((nuevosDias.length / 6) * 100);

      setTicketAsistencia({
        trabajador: nombreClean,
        dia: diaSemana,
        totalDias: nuevosDias.length,
        porcentaje: porcentajeAcumulado,
        obra: obraPrev.nombre
      });

      // Guardar en Supabase
      supabase.from('asistencias').upsert({
        obra_id: obraSeleccionada,
        trabajador: nombreClean,
        dias: nuevosDias
      }).then();

      return {
        ...prev,
        [obraSeleccionada]: {
          ...obraPrev,
          asistencias: asistenciasObra
        }
      };
    });

    setNombreTrabajador('');
  };

  // 2. REGISTRAR AVANCE POR DÍA (SUMA DÍA A DÍA LUNES-SÁBADO)
  const handleCargarFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setFotoPreview(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarAvance = (e) => {
    e.preventDefault();
    const incremento = parseInt(avanceInput);
    if (isNaN(incremento) || incremento <= 0) {
      alert('Ingresa un % de avance válido.');
      return;
    }

    setObras((prev) => {
      const obraPrev = prev[obraSeleccionada];
      const nuevosAvancesDia = {
        ...obraPrev.avancesPorDia,
        [diaSemana]: (obraPrev.avancesPorDia[diaSemana] || 0) + incremento
      };

      // Sumar el porcentaje de todos los días (Lunes a Sábado)
      const nuevoTotalAvance = Math.min(100, Object.values(nuevosAvancesDia).reduce((a, b) => a + b, 0));

      // Guardar en Supabase
      supabase.from('obras')
        .update({ 
          porcentaje_avance: nuevoTotalAvance,
          avances_por_dia: nuevosAvancesDia 
        })
        .eq('id', obraSeleccionada)
        .then();

      alert(`✓ Avance registrado para el ${diaSemana}: +${incremento}%. Total acumulado de la obra: ${nuevoTotalAvance}%.`);

      return {
        ...prev,
        [obraSeleccionada]: {
          ...obraPrev,
          porcentajeAvance: nuevoTotalAvance,
          avancesPorDia: nuevosAvancesDia,
          foto: fotoPreview || obraPrev.foto
        }
      };
    });

    setAvanceInput('');
    setFotoPreview(null);
  };

  // 3. CONSULTAR PORTAL DUEÑO
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

  // 4. REGISTRAR PAGO DEL DUEÑO
  const handleRealizarPagoDueno = (e) => {
    e.preventDefault();
    const pago = parseFloat(montoPago);
    if (!pago || pago <= 0) {
      alert('Ingresa un monto válido en Soles.');
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

    setObras((prev) => ({
      ...prev,
      [obraConsultadaId]: {
        ...prev[obraConsultadaId],
        montoRecibido: nuevoTotalRecibido,
        pagosDueno: [{ fecha: fechaActual, monto: pago }, ...prev[obraConsultadaId].pagosDueno]
      }
    }));

    // Actualizar en Supabase
    supabase.from('obras').update({ monto_recibido: nuevoTotalRecibido }).eq('id', obraConsultadaId).then();
    supabase.from('pagos_dueno').insert({ obra_id: obraConsultadaId, fecha: fechaActual, monto: pago }).then();

    alert(`✓ Pago de S/. ${pago.toFixed(2)} recibido correctamente.`);
    setMontoPago('');
  };

  // 5. GERENTE: PAGAR A PERSONAL
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

  // 6. REINICIAR ASISTENCIAS Y AVANCES DE LA SEMANA
  const handleReiniciarAsistenciasSemana = () => {
    if (window.confirm('¿Deseas reiniciar la lista de asistencias semanales a 0 para iniciar una nueva semana?')) {
      setObras((prev) => {
        const copia = { ...prev };
        Object.keys(copia).forEach((key) => {
          copia[key].asistencias = {};
        });
        return copia;
      });
      alert('✓ Asistencias semanales reiniciadas correctamente.');
    }
  };

  // 7. FINALIZAR / ARCHIVAR OBRA
  const handleFinalizarObra = (idObra) => {
    if (window.confirm(`¿Confirmas que la obra ${idObra} ha sido finalizada? Pasará a obras archivadas.`)) {
      setObras((prev) => ({
        ...prev,
        [idObra]: { ...prev[idObra], finalizada: true, porcentajeAvance: 100 }
      }));

      supabase.from('obras').update({ finalizada: true, porcentaje_avance: 100 }).eq('id', idObra).then();
    }
  };

  // Obtener consolidado de trabajadores
  const obtenerConsolidadoTrabajadores = () => {
    const mapa = {};
    Object.values(obras).forEach((obra) => {
      Object.entries(obra.asistencias).forEach(([trabajador, dias]) => {
        const tLower = trabajador.trim();
        if (!mapa[tLower]) {
          mapa[tLower] = { nombre: tLower, dias: new Set(), obra: obra.nombre };
        }
        dias.forEach((d) => mapa[tLower].dias.add(d));
      });
    });
    return Object.values(mapa).map((item) => ({
      nombre: item.nombre,
      diasAsistidos: item.dias.size,
      porcentaje: Math.round((item.dias.size / 6) * 100),
      obra: item.obra
    }));
  };

  const obraConsultada = obraConsultadaId ? obras[obraConsultadaId] : null;
  const listaConsolidadaTrabajadores = obtenerConsolidadoTrabajadores();
  const obrasActivas = Object.values(obras).filter((o) => !o.finalizada);
  const obrasArchivadas = Object.values(obras).filter((o) => o.finalizada);
  const diasSemanaList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div style={{ maxWidth: '950px', margin: '20px auto', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      
      {/* ENCABEZADO */}
      <header style={{ background: '#329db8', color: '#fff', padding: '20px', borderRadius: '8px 8px 0 0', borderBottom: '4px solid #2563eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', margin: 0 }}>Sistema Control de Obras y Finanzas</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#d6e419' }}>Sistema en Vivo - Control Semanal</p>
        </div>
        <span style={{ background: 'rgba(37,99,235,0.3)', color: '#60a5fa', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          VERCEL ONLINE
        </span>
      </header>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav style={{ display: 'flex', background: '#e2e8f0' }}>
        <button
          onClick={() => setTab('trabajador')}
          style={{ flex: 1, padding: '14px', border: 'none', background: tab === 'trabajador' ? '#fff' : 'transparent', fontWeight: 'bold', color: tab === 'trabajador' ? '#2563eb' : '#64748b', cursor: 'pointer', borderBottom: tab === 'trabajador' ? '3px solid #2563eb' : 'none' }}
        >
          Módulo Trabajador
        </button>
        <button
          onClick={() => setTab('dueno')}
          style={{ flex: 1, padding: '14px', border: 'none', background: tab === 'dueno' ? '#fff' : 'transparent', fontWeight: 'bold', color: tab === 'dueno' ? '#2563eb' : '#64748b', cursor: 'pointer', borderBottom: tab === 'dueno' ? '3px solid #2563eb' : 'none' }}
        >
          Portal Dueño de Casa
        </button>
        <button
          onClick={() => setTab('gerente')}
          style={{ flex: 1, padding: '14px', border: 'none', background: tab === 'gerente' ? '#fff' : 'transparent', fontWeight: 'bold', color: tab === 'gerente' ? '#2563eb' : '#64748b', cursor: 'pointer', borderBottom: tab === 'gerente' ? '3px solid #2563eb' : 'none' }}
        >
          Panel Gerencial (Gerente)
        </button>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ background: '#fff', padding: '25px', border: '1px solid #cbd5e1', borderRadius: '0 0 8px 8px' }}>

        {/* 1. MÓDULO TRABAJADOR */}
        {tab === 'trabajador' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '15px' }}>Registro de Asistencia y Avances</h2>

            <form onSubmit={handleRegistrarAsistencia} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>1. Registrar Asistencia Semanal</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Nombre Trabajador:</label>
                  <input
                    type="text"
                    value={nombreTrabajador}
                    onChange={(e) => setNombreTrabajador(e.target.value)}
                    placeholder="Ej. Marco Silva"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Día Asistido:</label>
                  <select
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    {diasSemanaList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Seleccionar Obra:</label>
                <select
                  value={obraSeleccionada}
                  onChange={(e) => setObraSeleccionada(e.target.value)}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  {obrasActivas.map((o) => (
                    <option key={o.id} value={o.id}>{o.nombre}</option>
                  ))}
                </select>
              </div>

              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                REGISTRAR ASISTENCIA DEL DÍA
              </button>

              {ticketAsistencia && (
                <div style={{ marginTop: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>✓ ASISTENCIA REGISTRADA:</strong> <strong>{ticketAsistencia.trabajador}</strong> asistió el <strong>{ticketAsistencia.dia}</strong>.
                    <br />
                    Asistencias acumuladas esta semana: <strong>{ticketAsistencia.totalDias} de 6 días</strong> (<strong style={{ color: '#16a34a' }}>{ticketAsistencia.porcentaje}%</strong>).
                  </p>
                </div>
              )}
            </form>

            <form onSubmit={handleGuardarAvance} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>2. Reportar Avance de Obra por Día (% que suma)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Día de Trabajo:</label>
                  <select
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    {diasSemanaList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>% Avance que suma este día (Ej. 10%):</label>
                  <input
                    type="number"
                    value={avanceInput}
                    onChange={(e) => setAvanceInput(e.target.value)}
                    placeholder="Ej. 10"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Foto Evidencia del Día:</label>
                <input type="file" accept="image/*" onChange={handleCargarFoto} style={{ marginTop: '4px', display: 'block' }} />
              </div>

              {fotoPreview && (
                <div style={{ marginBottom: '15px' }}>
                  <img src={fotoPreview} alt="Evidencia" style={{ maxHeight: '180px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              )}

              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                SUMAR AVANCE DEL DÍA
              </button>
            </form>
          </div>
        )}

        {/* 2. PORTAL DUEÑO DE CASA */}
        {tab === 'dueno' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '15px' }}>Portal Privado del Dueño de Casa</h2>
            
            <form onSubmit={handleBuscarObraDueno} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                Ingresa el código privado de tu propiedad (Ej. <strong>LARAPA-01</strong>, <strong>LARAPA-02</strong>, <strong>ANDINA-01</strong>, <strong>SAYLLA-01</strong>):
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={codigoBuscar}
                  onChange={(e) => setCodigoBuscar(e.target.value)}
                  placeholder="LARAPA-01"
                  style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
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

                {/* TARJETAS PRESUPUESTO */}
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

                {/* REGISTRAR ABONO DEL DUEÑO */}
                {!obraConsultada.finalizada && (
                  <div style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0f172a' }}>Abonar Cuota / Pago Adelantado</h4>
                    <form onSubmit={handleRealizarPagoDueno} style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '10px', fontWeight: 'bold', color: '#64748b' }}>S/.</span>
                        <input
                          type="number"
                          step="0.01"
                          value={montoPago}
                          onChange={(e) => setMontoPago(e.target.value)}
                          placeholder="Monto a abonar"
                          style={{ width: '100%', padding: '10px 10px 10px 35px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>
                        REGISTRAR ABONO
                      </button>
                    </form>
                  </div>
                )}

                {/* AVANCE FÍSICO */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <span>Avance Acumulado de Obra:</span>
                    <span style={{ color: '#2563eb' }}>{obraConsultada.porcentajeAvance}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '14px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ background: '#2563eb', height: '100%', width: `${obraConsultada.porcentajeAvance}%`, transition: 'width 0.4s' }}></div>
                  </div>
                </div>

                {/* HISTORIAL DE ABONOS */}
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>Historial de Abonos Recibidos:</p>
                  {obraConsultada.pagosDueno.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Aún no se han registrado abonos. Saldo pendiente 100%.</p>
                  ) : (
                    <ul style={{ fontSize: '0.85rem', paddingLeft: '20px', color: '#334155', margin: 0 }}>
                      {obraConsultada.pagosDueno.map((p, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>
                          Fecha {p.fecha}: <strong>S/. {p.monto.toFixed(2)}</strong>
                        </li>
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

            {/* TABLA RESUMEN FINANCIERO (SIN COLUMNAS EXTRAÑAS) */}
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
                  {obrasActivas.map((o) => {
                    const saldo = o.presupuestoTotal - o.montoRecibido;
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px' }}>
                          <strong>{o.nombre}</strong><br />
                          <code style={{ color: '#64748b' }}>{o.id}</code>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#0369a1' }}>
                          S/. {o.presupuestoTotal.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>
                          S/. {o.montoRecibido.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', color: '#b45309', fontWeight: 'bold' }}>
                          S/. {saldo.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button
                            onClick={() => handleFinalizarObra(o.id)}
                            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Finalizar Obra
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TABLA EXCLUSIVA: REGISTRO DE AVANCES % POR DÍA (LUNES A SÁBADO) */}
            <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginBottom: '25px', background: '#fff' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 12px 0', color: '#0f172a' }}>📊 Registro de Avance % de Obras por Días (Lunes a Sábado)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#fff', textAlign: 'center' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Obra</th>
                      {diasSemanaList.map((d) => (
                        <th key={d} style={{ padding: '10px' }}>{d}</th>
                      ))}
                      <th style={{ padding: '10px', background: '#2563eb' }}>Avance Total %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obrasActivas.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>{o.nombre}</td>
                        {diasSemanaList.map((d) => {
                          const val = o.avancesPorDia ? o.avancesPorDia[d] || 0 : 0;
                          return (
                            <td key={d} style={{ padding: '10px', color: val > 0 ? '#16a34a' : '#94a3b8', fontWeight: val > 0 ? 'bold' : 'normal' }}>
                              {val > 0 ? `+${val}%` : '0%'}
                            </td>
                          );
                        })}
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb', background: '#eff6ff' }}>
                          {o.porcentajeAvance}% / 100%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLA DE ASISTENCIA SEMANAL POR TRABAJADOR */}
            <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginBottom: '25px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.95rem', margin: 0, color: '#0f172a' }}>📋 Asistencia Semanal por Trabajador</h3>
                <button
                  onClick={handleReiniciarAsistenciasSemana}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Reiniciar Asistencias de la Semana (Domingos)
                </button>
              </div>

              {listaConsolidadaTrabajadores.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>No hay asistencias registradas esta semana.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#fff', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Trabajador</th>
                      <th style={{ padding: '8px' }}>Obra Asignada</th>
                      <th style={{ padding: '8px' }}>Días Asistidos</th>
                      <th style={{ padding: '8px' }}>% Asistencia Semanal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaConsolidadaTrabajadores.map((t, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.nombre}</td>
                        <td style={{ padding: '8px', color: '#64748b' }}>{t.obra}</td>
                        <td style={{ padding: '8px' }}>{t.diasAsistidos} / 6 días</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: t.porcentaje >= 80 ? '#16a34a' : '#d97706' }}>
                          {t.porcentaje}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* MÓDULO PARA PAGAR A TRABAJADOR */}
            <form onSubmit={handlePagarPersonal} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', marginBottom: '25px', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 12px 0', color: '#0f172a' }}>Pagar Sueldo a Personal</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Nombre Trabajador:</label>
                  <input
                    type="text"
                    value={nombrePersonalPago}
                    onChange={(e) => setNombrePersonalPago(e.target.value)}
                    placeholder="Ej. Marco Silva"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Monto a Pagar (S/.):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={montoSueldoPago}
                    onChange={(e) => setMontoSueldoPago(e.target.value)}
                    placeholder="Ej. 350.00"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                REGISTRAR PAGO A PERSONAL
              </button>
            </form>

            {/* SECCIÓN OBRAS ARCHIVADAS / FINALIZADAS */}
            {obrasArchivadas.length > 0 && (
              <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '0.95rem', margin: '0 0 10px 0', color: '#15803d' }}>📂 Historial de Obras Finalizadas y Archivadas</h3>
                <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: '20px' }}>
                  {obrasArchivadas.map((o) => (
                    <li key={o.id} style={{ marginBottom: '6px' }}>
                      <strong>{o.nombre}</strong> (<code>{o.id}</code>) - Presupuesto: S/. {o.presupuestoTotal.toFixed(2)} - Recibido: S/. {o.montoRecibido.toFixed(2)} (Concluida 100%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
