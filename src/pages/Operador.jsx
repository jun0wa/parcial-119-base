import { useState } from 'react'
import { Link } from 'react-router-dom'
import MapaOperador from '../mapa/MapaOperador.jsx'
import { useReportes, TRANSICIONES } from '../context/ReportesContext.jsx'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'

// Ubicación en el proyecto: src/pages/Operador.jsx

const UNIDADES = ['Máquina', 'Rescate', 'Ambulancia', 'HazMat']

const COLOR_ESTADO = {
  'Recibido': '#f59e0b',
  'Validado': '#3b82f6',
  'Unidad despachada': '#8b5cf6',
  'Cerrado': '#64748b',
  'Descartado': '#64748b',
}

const formatearHora = (iso) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

const nombreDeGrupo = (codigo) => GRUPOS.find((g) => g.codigo === codigo)?.nombre ?? 'Sin clasificar'

export default function Operador() {
  const { reportes, cambiarEstado, agregarReporte } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)

  const seleccionado = reportes.find((r) => r.id === seleccionadoId)
  // Los más recientes arriba (sin modificar el arreglo original)
  const ordenados = [...reportes].reverse()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: '100vh' }}>
      <MapaOperador
        reportes={reportes}
        seleccionadoId={seleccionadoId}
        onSeleccionar={setSeleccionadoId}
      />

      <aside
        style={{
          padding: 16, background: '#0f172a', color: '#e2e8f0',
          overflowY: 'auto', borderLeft: '1px solid #1e293b',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Radio operador</h2>


        {/* ---------- Lista de reportes ---------- */}
        {ordenados.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aún no hay reportes. Envía uno desde /reportar.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 240, overflowY: 'auto' }}>
            {ordenados.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSeleccionadoId(r.id)}
                  style={{
                    width: '100%', textAlign: 'left', margin: '4px 0', padding: '8px 10px',
                    borderRadius: 8, border: '1px solid #334155', cursor: 'pointer', color: '#e2e8f0',
                    borderLeft: `6px solid ${colorDeGrupo(r.grupo)}`,
                    background: r.id === seleccionadoId ? '#1e3a5f' : '#111827',
                  }}
                >
                  <strong>{r.grupo}</strong> · {r.barrio} · {formatearHora(r.hora)}
                  <br />
                  <small style={{ color: COLOR_ESTADO[r.estado] }}>● {r.estado}</small>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* ---------- Detalle del reporte seleccionado ---------- */}
        {seleccionado && (
          // key hace que el detalle reinicie su estado interno al cambiar de reporte
          <DetalleReporte
            key={seleccionado.id}
            reporte={seleccionado}
            cambiarEstado={cambiarEstado}
          />
        )}

        <p style={{ marginTop: 24 }}>
          <Link to="/" style={{ color: '#7dd3fc' }}>Volver a la landing</Link>
        </p>
      </aside>
    </div>
  )
}

function DetalleReporte({ reporte, cambiarEstado }) {
  const [grupo, setGrupo] = useState(reporte.grupo)
  const [unidad, setUnidad] = useState('')

  // ¿Este reporte puede pasar al estado indicado? (reglas del Context)
  const puede = (estado) => TRANSICIONES[reporte.estado]?.includes(estado)

  const googleMaps = `https://www.google.com/maps?q=${reporte.lat},${reporte.lng}`

  return (
    <section style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #334155' }}>
      <h3 style={{ margin: '0 0 4px' }}>
        Reporte {reporte.radicado}
      </h3>
      <span
        style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 999,
          background: COLOR_ESTADO[reporte.estado], color: '#0f172a', fontWeight: 700, fontSize: 12,
        }}
      >
        {reporte.estado}
      </span>

      <h4 style={{ marginBottom: 4 }}>Ciudadano</h4>
      <Dato etiqueta="Nombre" valor={`${reporte.nombres} ${reporte.apellidos}`} />
      <Dato etiqueta="Teléfono" valor={reporte.telefono} />

      <h4 style={{ marginBottom: 4 }}>Emergencia</h4>
      <Dato
        etiqueta="Grupo"
        valor={`${reporte.grupo} · ${nombreDeGrupo(reporte.grupo)}`}
      />
      <Dato etiqueta="¿Qué ve?" valor={reporte.queVe} />
      <Dato etiqueta="Dirección" valor={reporte.direccion} />
      <Dato etiqueta="Barrio" valor={reporte.barrio} />
      <Dato etiqueta="Referencia" valor={reporte.referencia} />
      <Dato etiqueta="Edificio" valor={reporte.edificio || 'No aplica'} />
      <Dato etiqueta="Hora" valor={formatearHora(reporte.hora)} />
      {reporte.unidad && <Dato etiqueta="Unidad" valor={reporte.unidad} />}

      {/* Fotos */}
      {reporte.fotos?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
          {reporte.fotos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Foto ${i + 1} del reporte`}
              style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
              // Las URLs temporales dejan de existir al recargar la página
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ))}
        </div>
      )}

      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href={`tel:${reporte.telefono}`} style={enlace}>📞 Llamar</a>
        <a href={googleMaps} target="_blank" rel="noreferrer" style={enlace}>
          🗺️ Ver en Google Maps
        </a>
      </p>

      {/* ---------- Validar o descartar ---------- */}
      <h4 style={{ marginBottom: 4 }}>Validar</h4>
      <label style={{ display: 'block', fontSize: 12, color: '#94a3b8' }}>
        Grupo (puedes corregirlo)
        <select
          value={grupo}
          onChange={(e) => setGrupo(Number(e.target.value))}
          disabled={!puede('Validado')}
          style={campo}
        >
          {GRUPOS.map((g) => (
            <option key={g.codigo} value={g.codigo}>
              {g.codigo} · {g.nombre}
            </option>
          ))}
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          style={boton('#2563eb', !puede('Validado'))}
          disabled={!puede('Validado')}
          onClick={() => cambiarEstado(reporte.id, 'Validado', { grupo })}
        >
          Validar
        </button>
        <button
          style={boton('#dc2626', !puede('Descartado'))}
          disabled={!puede('Descartado')}
          onClick={() => cambiarEstado(reporte.id, 'Descartado')}
        >
          Descartar
        </button>
      </div>

      {/* ---------- Despachar y cerrar ---------- */}
      <h4 style={{ marginBottom: 4 }}>Despachar</h4>
      <select
        value={unidad}
        onChange={(e) => setUnidad(e.target.value)}
        disabled={!puede('Unidad despachada')}
        style={campo}
      >
        <option value="">Elegir unidad...</option>
        {UNIDADES.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          style={boton('#7c3aed', !puede('Unidad despachada') || !unidad)}
          disabled={!puede('Unidad despachada') || !unidad}
          onClick={() => cambiarEstado(reporte.id, 'Unidad despachada', { unidad })}
        >
          Despachar
        </button>
        <button
          style={boton('#475569', !puede('Cerrado'))}
          disabled={!puede('Cerrado')}
          onClick={() => cambiarEstado(reporte.id, 'Cerrado')}
        >
          Cerrar caso
        </button>
      </div>
    </section>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div style={{ fontSize: 14, margin: '2px 0' }}>
      <span style={{ color: '#94a3b8' }}>{etiqueta}: </span>
      {valor}
    </div>
  )
}

/* ---------- Estilos reutilizables ---------- */
const enlace = { color: '#7dd3fc', textDecoration: 'none', fontSize: 14 }

const campo = {
  width: '100%', marginTop: 4, padding: 8, borderRadius: 6,
  border: '1px solid #334155', background: '#111827', color: '#e2e8f0',
}

const boton = (color, deshabilitado) => ({
  flex: 1, padding: '8px 10px', borderRadius: 6, border: 'none',
  background: color, color: '#fff', fontWeight: 600,
  cursor: deshabilitado ? 'not-allowed' : 'pointer',
  opacity: deshabilitado ? 0.4 : 1,
})