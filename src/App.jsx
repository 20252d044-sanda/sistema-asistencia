import React, { useState } from 'react';

export default function App() {
  const [tab, setTab] = useState('trabajador');

  // Base de Datos con Presupuestos ajustados (Menores a S/. 15,000)
  const [obras, setObras] = useState({
    'LARAPA-01': {
      id: 'LARAPA-01',
      nombre: 'Obra Larapa (Casa Residencial)',
      ubicacion: 'Sector Larapa #12',
      presupuestoTotal: 6500,
      montoRecibido: 2000,
      avanceProgramado: 80,
      porcentajeAvance: 60,
      foto: null,
      asistencias: {
        'Edu Flores': ['Lunes', 'Miércoles', 'Viernes']
      },
      pagosDueno: [{ fecha: '01/10/2026', monto: 2000 }]
    },
    'SAYLLA-02': {
      id: 'SAYLLA-02',
      nombre: 'Obra Saylla (Instalación Tableros)',
      ubicacion: 'Av. Principal Saylla #45',
      presupuestoTotal: 3800,
      montoRecibido: 1500,
      avanceProgramado: 50,
      porcentajeAvance: 40,
      foto: null,
      asistencias: {},
      pagosDueno: [{ fecha: '01/10/2026', monto: 1500 }]
    },
    'ANDINA-03': {
      id: 'ANDINA-03',
      nombre: 'Obra Andina (Cableado General)',
      ubicacion: 'Urbanización Andina B-4',
      presupuestoTotal: 8200,
      montoRecibido: 3000,
      avanceProgramado: 30,
      porcentajeAvance: 25,
      foto: null,
      asistencias: {},
      pagosDueno: [{ fecha: '28/09/2026', monto: 3000 }]
    }
  });

  // Historial de pagos directos al personal
  const [historialPagosPersonal, setHistorialPagosPersonal] = useState([
    { trabajador: 'Edu Flores', fecha: '02/10/2026', monto: 250 }
  ]);

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

  // Panel Gerencial: Pagar Personal
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

  // 2. REGISTRAR AVANCE Y FOTO
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
    if (!avanceInput) {
      alert('Ingresa el % de avance.');
      return;
    }

    setObras((prev) => ({
      ...prev,
      [obraSeleccionada]: {
        ...prev[obraSeleccionada],
        porcentajeAvance: parseInt(avanceInput),
        foto: fotoPreview || prev[obraSeleccionada].foto
      }
    }));

    alert(`✓ Avance del ${avanceInput}% y foto guardados correctamente.`);
    setAvanceInput('');
  };

  // 3. CONSULTAR PORTAL DUEÑO
  const handleBuscarObraDueno = (e) => {
    e.preventDefault();
    const cod = codigoBuscar.trim().toUpperCase();
    if (obras[cod]) {
      setObraConsultadaId(cod);
    } else {
      alert('Código no encontrado. Prueba con: LARAPA-01, SAYLLA-02 o ANDINA-03');
      setObraConsultadaId(null);
    }
  };

  // 4. REGISTRAR PAGO DEL DUEÑO (SE DESCUENTA DEL PRESUPUESTO)
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

    setObras((prev) => ({
      ...prev,
      [obraConsultadaId]: {
        ...prev[obraConsultadaId],
        montoRecibido: prev[obraConsultadaId].montoRecibido + pago,
        pagosDueno: [{ fecha: fechaActual, monto: pago }, ...prev[obraConsultadaId].pagosDueno]
      }
    }));

    alert(`✓ Pago de S/. ${pago.toFixed(2)} recibido correctamente.`);
    setMontoPago('');
  };

  // 5. GERENTE: PAGAR A PERSONAL (Solo Nombre y Monto + Consulta de Asistencia)
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

  // Obtener total de días asistidos de un trabajador en todas las obras
  const obtenerDiasAsistidosPersonal = (nombre) => {
    if (!nombre.trim()) return 0;
    let totalDias = 0;
    Object.values(obras).forEach((obra) => {
      Object.entries(obra.asistencias).forEach(([trabajador, dias]) => {
        if (trabajador.toLowerCase() === nombre.trim().toLowerCase()) {
          totalDias += dias.length;
        }
      });
    });
    return totalDias;
  };

  const calcularAsistenciaPromedioObra = (asistencias) => {
    const listaTrabajadores = Object.keys(asistencias);
    if (listaTrabajadores.length === 0) return 0;
    const sumaPorcentajes = listaTrabajadores.reduce((acc, t) => {
      return acc + (asistencias[t].length / 6) * 100;
    }, 0);
    return Math.round(sumaPorcentajes / listaTrabajadores.length);
  };

  const obraConsultada = obraConsultadaId ? obras[obraConsultadaId] : null;
  const diasAsistidosConsulta = obtenerDiasAsistidosPersonal(nombrePersonalPago);

  return (
    <div style={{ maxWidth: '950px', margin: '20px auto', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      
      {/* ENCABEZADO */}
      <header style={{ background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '8px 8px 0 0', borderBottom: '4px solid #2563eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', margin: 0 }}>Sistema Control de Obras y Finanzas</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Servidor Localhost Activo</p>
        </div>
        <span style={{ background: 'rgba(37,99,235,0.3)', color: '#60a5fa', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          LOCAL HOST OK
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
                    placeholder="Ej. Edu Flores"
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
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
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
                  {Object.values(obras).map((o) => (
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
                    Asistencias acumuladas: <strong>{ticketAsistencia.totalDias} de 6 días</strong> (<strong style={{ color: '#16a34a' }}>{ticketAsistencia.porcentaje}%</strong>).
                  </p>
                </div>
              )}
            </form>

            <form onSubmit={handleGuardarAvance} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>2. Reportar Avance y Foto</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>% Avance de Obra:</label>
                  <input
                    type="number"
                    value={avanceInput}
                    onChange={(e) => setAvanceInput(e.target.value)}
                    placeholder="Ej. 65"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Foto Evidencia:</label>
                  <input type="file" accept="image/*" onChange={handleCargarFoto} style={{ marginTop: '4px' }} />
                </div>
              </div>

              {fotoPreview && (
                <div style={{ marginBottom: '15px' }}>
                  <img src={fotoPreview} alt="Evidencia" style={{ maxHeight: '180px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              )}

              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                GUARDAR AVANCE Y FOTO
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
                Ingresa el código privado de tu propiedad (Ej. <strong>LARAPA-01</strong>, <strong>SAYLLA-02</strong>, <strong>ANDINA-03</strong>):
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
                <h3 style={{ margin: 0, color: '#0f172a' }}>{obraConsultada.nombre}</h3>
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

                <div style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0f172a' }}>Abonar Cuota (en Soles)</h4>
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

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <span>Avance Físico de Obra:</span>
                    <span style={{ color: '#2563eb' }}>{obraConsultada.porcentajeAvance}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '14px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ background: '#2563eb', height: '100%', width: `${obraConsultada.porcentajeAvance}%`, transition: 'width 0.4s' }}></div>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>Historial de Abonos:</p>
                  <ul style={{ fontSize: '0.85rem', paddingLeft: '20px', color: '#334155', margin: 0 }}>
                    {obraConsultada.pagosDueno.map((p, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        Fecha {p.fecha}: <strong>S/. {p.monto.toFixed(2)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. PANEL GERENCIAL */}
        {tab === 'gerente' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '15px' }}>Panel de Control Gerencial</h2>

            {/* MÓDULO PARA PAGAR A TRABAJADOR (SOLO NOMBRE Y MONTO) */}
            <form onSubmit={handlePagarPersonal} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', marginBottom: '25px', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 12px 0', color: '#0f172a' }}>Pagar Sueldo a Personal</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Nombre Trabajador:</label>
                  <input
                    type="text"
                    value={nombrePersonalPago}
                    onChange={(e) => setNombrePersonalPago(e.target.value)}
                    placeholder="Ej. Edu Flores"
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
                    placeholder="Ej. 300.00"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              {/* MUESTRA LAS ASISTENCIAS SEGÚN EL NOMBRE QUE ESCRIBES */}
              {nombrePersonalPago.trim() !== '' && (
                <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #bae6fd', fontSize: '0.85rem' }}>
                  📊 Asistencias registradas para <strong>{nombrePersonalPago}</strong>: <strong style={{ color: '#0369a1' }}>{diasAsistidosConsulta} día(s) en la semana</strong>.
                </div>
              )}

              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                REGISTRAR PAGO A PERSONAL
              </button>
            </form>

            {/* HISTORIAL DE PAGOS REALIZADOS A PERSONAL */}
            <div style={{ marginBottom: '25px', background: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Historial de Pagos Realizados al Personal:</h4>
              {historialPagosPersonal.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>No hay pagos a personal registrados.</p>
              ) : (
                <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: '20px' }}>
                  {historialPagosPersonal.map((p, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      Fecha {p.fecha} — <strong>{p.trabajador}</strong>: <strong style={{ color: '#16a34a' }}>S/. {p.monto.toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* TABLA RESUMEN GENERAL (SIN GASTO PERSONAL Y CON MONTO RECIBIDO) */}
            <h3 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Resumen General de Obras</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Obra / Código</th>
                    <th style={{ padding: '10px' }}>Presupuesto Total</th>
                    <th style={{ padding: '10px' }}>Monto Recibido</th>
                    <th style={{ padding: '10px' }}>Saldo Pendiente</th>
                    <th style={{ padding: '10px' }}>Avance Prog. vs Real</th>
                    <th style={{ padding: '10px' }}>% Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(obras).map((o) => {
                    const saldo = o.presupuestoTotal - o.montoRecibido;
                    const pctAsistencia = calcularAsistenciaPromedioObra(o.asistencias);
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
                          Prog: <strong>{o.avanceProgramado}%</strong> | Real: <strong style={{ color: o.porcentajeAvance >= o.avanceProgramado ? '#16a34a' : '#d97706' }}>{o.porcentajeAvance}%</strong>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>
                          {pctAsistencia}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}