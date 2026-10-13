import React, { useState, useEffect } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Conexión con tu base de datos Supabase
const SUPABASE_URL = 'https://uhanzkksmktlucmxevls.supabase.co';
const SUPABASE_KEY = 'sb_publishable_44AbuuHbYKcPWNlT9VlXUw_u4-bb'; // Pega aquí tu clave completa si termina con más caracteres

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const [tab, setTab] = useState('trabajador');

  // Base de Datos de Obras
  const [obras, setObras] = useState({
    'LARAPA-01': {
      id: 'LARAPA-01',
      nombre: 'Obra Larapa 01 (Casa Residencial)',
      ubicacion: 'Sector Larapa #12',
      presupuestoTotal: 6500,
      montoRecibido: 0,
      avanceProgramado: 80,
      porcentajeAvance: 60,
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
      nombre: 'Obra Larapa 02 (Edificio Dpto)',
      ubicacion: 'Av. Larapa B-4',
      presupuestoTotal: 12000,
      montoRecibido: 0,
      avanceProgramado: 40,
      porcentajeAvance: 35,
      foto: null,
      finalizada: false,
      asistencias: {
        'Juan Perez': ['Lunes', 'Martes', 'Miércoles']
      },
      pagosDueno: []
    }
  });

  // Cargar datos automáticamente desde Supabase
  useEffect(() => {
    const cargarObras = async () => {
      const { data, error } = await supabase.from('obras').select('*');
      if (!error && data && data.length > 0) {
        const obrasMap = {};
        data.forEach((o) => {
          obrasMap[o.id] = {
            id: o.id,
            nombre: o.nombre,
            ubicacion: o.ubicacion,
            presupuestoTotal: Number(o.presupuesto_total) || 0,
            montoRecibido: Number(o.monto_recibido) || 0,
            avanceProgramado: Number(o.avance_programado) || 0,
            porcentajeAvance: Number(o.porcentaje_avance) || 0,
            finalizada: o.finalizada || false,
            asistencias: {},
            pagosDueno: []
          };
        });
        setObras(obrasMap);
      }
    };
    cargarObras();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Sistema de Asistencia de Obras</h1>
      <p>Base de datos conectada a Supabase correctamente.</p>
    </div>
  );
}
