import { useState } from 'react'
import { Link } from 'react-router-dom'
import MapaOperador from '../mapa/MapaOperador.jsx'
import { BARRIOS } from '../data/barrios.js'

// Reportes de PRUEBA para ver el mapa funcionando.
// TODO (estudiantes): reemplazarlos por los reportes del estado global
// (los que envía el ciudadano desde /reportar).
const REPORTES_DEMO = [
  { id: 1, grupo: 100, barrio: 'San Antonio', estado: 'Recibido' },
  { id: 2, grupo: 300, barrio: 'Siloé', estado: 'Recibido' },
  { id: 3, grupo: 400, barrio: 'Valle del Lili', estado: 'Unidad despachada' },
  { id: 4, grupo: 800, barrio: 'Floralia', estado: 'Recibido' },
  { id: 5, grupo: 300, barrio: 'El Poblado', estado: 'Validado' },
  { id: 6, grupo: 100, barrio: 'Chipichape', estado: 'Recibido' },
  { id: 7, grupo: 500, barrio: 'Ciudad Jardín', estado: 'Cerrado' },
  { id: 8, grupo: 200, barrio: 'Junín', estado: 'Recibido' },
  { id: 9, grupo: 900, barrio: 'Meléndez', estado: 'Recibido' },
].map((r) => {
  const b = BARRIOS.find((x) => x.nombre === r.barrio)
  return { ...r, lat: b.lat, lng: b.lng }
})

export default function Operador() {
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const seleccionado = REPORTES_DEMO.find((r) => r.id === seleccionadoId)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: '100vh' }}>
      <MapaOperador
        reportes={REPORTES_DEMO}
        seleccionadoId={seleccionadoId}
        onSeleccionar={setSeleccionadoId}
      />
      <aside style={{ padding: 16, background: '#0f172a', color: '#e2e8f0', overflowY: 'auto', borderLeft: '1px solid #1e293b' }}>
        <h2>Radio operador</h2>
        {/* Lista mínima de ejemplo: al hacer clic, el mapa vuela al reporte.
            TODO (estudiantes): lista completa, detalle, llamar/validar y despacho. */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {REPORTES_DEMO.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setSeleccionadoId(r.id)}
                style={{
                  width: '100%', textAlign: 'left', margin: '4px 0', padding: '8px 10px', borderRadius: 8,
                  border: '1px solid #334155', cursor: 'pointer', color: '#e2e8f0',
                  background: r.id === seleccionadoId ? '#1e3a5f' : '#111827',
                }}
              >
                #{r.id} · {r.grupo} · {r.barrio}
                <br />
                <small style={{ color: '#94a3b8' }}>{r.estado}</small>
              </button>
            </li>
          ))}
        </ul>
        {seleccionado && <p>Seleccionado: reporte #{seleccionado.id}</p>}
        <Link to="/" style={{ color: '#7dd3fc' }}>Volver a la landing</Link>
      </aside>
    </div>
  )
}
