import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MapaOperador from '../mapa/MapaOperador.jsx'
import { useReportes, TRANSICIONES } from '../context/ReportesContext.jsx'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'

// Ubicación en el proyecto: src/pages/Operador.jsx
// Las clases .operador, .operador__mapa y .operador__panel están en src/index.css

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
  const { reportes, cambiarEstado } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)

  const seleccionado = reportes.find((r) => r.id === seleccionadoId)
  // Los más recientes arriba (sin modificar el arreglo original)
  const ordenados = [...reportes].reverse()

  return (
    <div className="operador">
      {/* El mapa y el panel son HERMANOS: los dos son hijos directos de .operador */}
      <div className="operador__mapa">
        <MapaOperador
          reportes={reportes}
          seleccionadoId={seleccionadoId}
          onSeleccionar={setSeleccionadoId}
        />
      </div>

      <aside className="operador__panel">
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
  const [fotoAmpliada, setFotoAmpliada] = useState(null) // URL de la foto abierta, o null

  // Con la foto abierta, la tecla Esc la cierra
  useEffect(() => {
    if (!fotoAmpliada) return
    const alPulsar = (e) => {
      if (e.key === 'Escape') setFotoAmpliada(null)
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [fotoAmpliada])

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

      {/* Fotos: al hacer clic en una miniatura se abre ampliada */}
      {reporte.fotos?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
          {reporte.fotos.map((src, i) => (
            <button
              key={i}
              onClick={() => setFotoAmpliada(src)}
              aria-label={`Ampliar foto ${i + 1}`}
              title="Clic para ampliar"
              style={{ padding: 0, border: 'none', background: 'none', cursor: 'zoom-in' }}
            >
              <img
                src={src}
                alt={`Foto ${i + 1} del reporte`}
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                // Las URLs temporales dejan de existir al recargar la página
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </button>
          ))}
        </div>
      )}

      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={`tel:${reporte.telefono}`} style={enlace}>
          <img src="/iconos/telefono.svg" alt="" width={16} height={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Llamar
        </a>
        <a href={googleMaps} target="_blank" rel="noreferrer" style={enlace}>
          <img src="/iconos/mapa.svg" alt="" width={16} height={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Ver en Google Maps
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

      {/* ---------- Visor de foto ampliada ---------- */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(null)}
          role="dialog"
          aria-label="Foto ampliada"
          style={visor}
        >
          <img
            src={fotoAmpliada}
            alt="Foto ampliada del reporte"
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }}
          />
          <button
            onClick={() => setFotoAmpliada(null)}
            aria-label="Cerrar foto"
            style={cerrarVisor}
          >
            ✕
          </button>
        </div>
      )}
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

// El visor tapa toda la pantalla. El z-index es alto para quedar por encima de los controles del mapa.
const visor = {
  position: 'fixed', inset: 0, zIndex: 10000,
  background: 'rgba(0, 0, 0, 0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'zoom-out',
}

const cerrarVisor = {
  position: 'absolute', top: 16, right: 16, width: 40, height: 40,
  borderRadius: '50%', border: 'none', background: '#fff', color: '#0f172a',
  fontSize: 18, fontWeight: 700, cursor: 'pointer',
}