import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReportes } from '../context/ReportesContext.jsx'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { BARRIOS } from '../data/barrios.js'

// Ubicación en el proyecto: src/pages/Reportar.jsx

const MAX_FOTOS = 3

const FORM_INICIAL = {
  nombres: '',
  apellidos: '',
  telefono: '',
  grupo: '',
  queVe: '',
  direccion: '',
  barrio: '',
  referencia: '',
  edificio: '',
  noAplica: false,
}

const COLOR_ESTADO = {
  'Recibido': '#f59e0b',
  'Validado': '#3b82f6',
  'Unidad despachada': '#8b5cf6',
  'Cerrado': '#64748b',
  'Descartado': '#64748b',
}

// Devuelve un objeto con un mensaje por cada campo que tenga error.
// Si el objeto está vacío, el formulario es válido.
function validar(f) {
  const e = {}
  if (!f.nombres.trim()) e.nombres = 'Escribe tus nombres.'
  if (!f.apellidos.trim()) e.apellidos = 'Escribe tus apellidos.'
  if (!/^\d{10}$/.test(f.telefono)) e.telefono = 'Debe tener exactamente 10 dígitos, solo números.'
  if (!f.grupo) e.grupo = 'Selecciona el grupo de emergencia.'
  if (!f.queVe.trim()) e.queVe = 'Cuéntanos qué está pasando.'
  if (!f.direccion.trim()) e.direccion = 'Escribe la dirección.'
  if (!f.barrio) e.barrio = 'Selecciona el barrio.'
  if (!f.referencia.trim()) e.referencia = 'Escribe un punto de referencia.'
  if (!f.noAplica && !f.edificio.trim()) {
    e.edificio = 'Escribe el nombre del edificio o marca «No aplica».'
  }
  return e
}

export default function Reportar() {
  const { reportes, agregarReporte } = useReportes()

  const [form, setForm] = useState(FORM_INICIAL)
  const [touched, setTouched] = useState({}) // campos que el usuario ya tocó
  const [fotos, setFotos] = useState([]) // URLs temporales de las miniaturas
  const [idEnviado, setIdEnviado] = useState(null)

  const errores = validar(form)
  const cantidadErrores = Object.keys(errores).length
  const hayErrores = cantidadErrores > 0

  // El error de un campo solo se muestra después de que el usuario lo toca
  const errorDe = (nombre) => (touched[nombre] ? errores[nombre] : undefined)

  function manejarCambio(e) {
    const { name, value } = e.target
    // En el teléfono solo se aceptan dígitos, máximo 10
    const limpio = name === 'telefono' ? value.replace(/\D/g, '').slice(0, 10) : value
    setForm((prev) => ({ ...prev, [name]: limpio }))
  }

  function marcarTocado(e) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  function manejarNoAplica(e) {
    const marcado = e.target.checked
    setForm((prev) => ({ ...prev, noAplica: marcado, edificio: marcado ? '' : prev.edificio }))
  }

  // Props comunes de cada campo controlado
  const propsCampo = (nombre) => ({
    name: nombre,
    value: form[nombre],
    onChange: manejarCambio,
    onBlur: marcarTocado,
    style: estilos.input,
  })

  function agregarFotos(e) {
    const archivos = Array.from(e.target.files)
    const cupo = MAX_FOTOS - fotos.length
    const nuevas = archivos.slice(0, cupo).map((archivo) => URL.createObjectURL(archivo))
    setFotos((prev) => [...prev, ...nuevas])
    e.target.value = '' // permite volver a elegir el mismo archivo
  }

  function quitarFoto(indice) {
    URL.revokeObjectURL(fotos[indice])
    setFotos((prev) => prev.filter((_, i) => i !== indice))
  }

  function enviar(e) {
    e.preventDefault()
    if (hayErrores) {
      // Por seguridad: si de algún modo se envía incompleto, se muestran todos los errores
      setTouched(Object.fromEntries(Object.keys(FORM_INICIAL).map((k) => [k, true])))
      return
    }
    const id = agregarReporte({
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      telefono: form.telefono,
      grupo: form.grupo,
      queVe: form.queVe.trim(),
      direccion: form.direccion.trim(),
      barrio: form.barrio,
      referencia: form.referencia.trim(),
      edificio: form.noAplica ? 'No aplica' : form.edificio.trim(),
      fotos,
    })
    setIdEnviado(id)
  }

  function nuevoReporte() {
    setForm(FORM_INICIAL)
    setTouched({})
    setFotos([])
    setIdEnviado(null)
  }

  // Si ya se envió, se muestra la confirmación leyendo el reporte DESDE EL CONTEXTO.
  // Así, cuando el operador cambia el estado, esta pantalla se actualiza sola.
  const reporteEnviado = reportes.find((r) => r.id === idEnviado)
  if (reporteEnviado) {
    return <Confirmacion reporte={reporteEnviado} onNuevo={nuevoReporte} />
  }

  return (
    <main style={estilos.pagina}>
      <Link to="/" style={estilos.enlace}>← Volver</Link>
      <h1 style={{ marginBottom: 4 }}>Reportar emergencia</h1>
      <p style={{ marginTop: 0, color: '#57534e' }}>
        Los campos con <span style={{ color: '#dc2626' }}>*</span> son obligatorios. Si la situación es
        crítica, <a href="tel:119" style={estilos.enlace}>llama al 119</a>.
      </p>

      <form onSubmit={enviar} noValidate>
        {/* ---------- Datos del ciudadano ---------- */}
        <fieldset style={estilos.seccion}>
          <legend style={estilos.leyenda}>Tus datos</legend>
          <div style={estilos.rejilla}>
            <Campo etiqueta="Nombres" error={errorDe('nombres')}>
              <input {...propsCampo('nombres')} autoComplete="given-name" />
            </Campo>
            <Campo etiqueta="Apellidos" error={errorDe('apellidos')}>
              <input {...propsCampo('apellidos')} autoComplete="family-name" />
            </Campo>
            <Campo etiqueta="Teléfono" error={errorDe('telefono')}>
              <input {...propsCampo('telefono')} inputMode="numeric" maxLength={10} placeholder="3001234567" />
            </Campo>
          </div>
        </fieldset>

        {/* ---------- Datos de la emergencia ---------- */}
        <fieldset style={estilos.seccion}>
          <legend style={estilos.leyenda}>La emergencia</legend>
          <div style={estilos.rejilla}>
            <Campo etiqueta="Grupo de emergencia" error={errorDe('grupo')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select {...propsCampo('grupo')}>
                  <option value="">Selecciona...</option>
                  {GRUPOS.map((g) => (
                    <option key={g.codigo} value={g.codigo}>
                      {g.codigo} · {g.nombre}
                    </option>
                  ))}
                </select>
                {form.grupo && (
                  <span
                    style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: colorDeGrupo(Number(form.grupo)),
                    }}
                  />
                )}
              </div>
            </Campo>

            <Campo etiqueta="Barrio" error={errorDe('barrio')}>
              <select {...propsCampo('barrio')}>
                <option value="">Selecciona...</option>
                {BARRIOS.map((b) => (
                  <option key={b.nombre} value={b.nombre}>{b.nombre}</option>
                ))}
              </select>
            </Campo>

            <Campo etiqueta="Dirección" error={errorDe('direccion')}>
              <input {...propsCampo('direccion')} placeholder="Calle 5 # 10-20" />
            </Campo>

            <Campo etiqueta="Punto de referencia" error={errorDe('referencia')}>
              <input {...propsCampo('referencia')} placeholder="Frente al parque, junto a la tienda..." />
            </Campo>
          </div>

          <Campo etiqueta="¿Qué ve?" error={errorDe('queVe')}>
            <textarea {...propsCampo('queVe')} rows={3} placeholder="Describe lo que está pasando" />
          </Campo>

          <Campo etiqueta="Nombre del edificio" error={errorDe('edificio')}>
            <input {...propsCampo('edificio')} disabled={form.noAplica} />
          </Campo>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <input type="checkbox" checked={form.noAplica} onChange={manejarNoAplica} />
            No aplica
          </label>
        </fieldset>

        {/* ---------- Fotos ---------- */}
        <fieldset style={estilos.seccion}>
          <legend style={estilos.leyenda}>Fotos (opcional)</legend>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: '#57534e' }}>
            Hasta {MAX_FOTOS} imágenes. Una foto ayuda al operador a entender la situación más rápido.
            ({fotos.length}/{MAX_FOTOS})
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={agregarFotos}
            disabled={fotos.length >= MAX_FOTOS}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {fotos.map((src, i) => (
              <div key={src} style={{ position: 'relative' }}>
                <img
                  src={src}
                  alt={`Miniatura ${i + 1}`}
                  style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }}
                />
                <button
                  type="button"
                  onClick={() => quitarFoto(i)}
                  aria-label={`Quitar foto ${i + 1}`}
                  style={estilos.quitar}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </fieldset>

        {hayErrores && (
          <p style={{ color: '#b45309', fontSize: 14 }}>
            Faltan {cantidadErrores} campo(s) obligatorio(s) por completar.
          </p>
        )}
        <button type="submit" disabled={hayErrores} style={estilos.enviar(hayErrores)}>
          Enviar reporte
        </button>
      </form>
    </main>
  )
}

// Etiqueta + control + mensaje de error. Se reutiliza en todos los campos.
function Campo({ etiqueta, error, children }) {
  return (
    <label style={estilos.campo}>
      <span style={estilos.etiqueta}>
        {etiqueta} <span style={{ color: '#dc2626' }}>*</span>
      </span>
      {children}
      {error && <span style={estilos.error}>{error}</span>}
    </label>
  )
}

// Pantalla de confirmación: radicado, hora y estado actual del reporte.
function Confirmacion({ reporte, onNuevo }) {
  const mensajes = {
    'Recibido': 'Tu reporte fue recibido. Un radio operador lo revisará y podría llamarte al número que registraste.',
    'Validado': 'Un operador validó tu reporte. Pronto se asignará una unidad.',
    'Unidad despachada': `Se despachó una unidad${reporte.unidad ? ` (${reporte.unidad})` : ''} hacia la ubicación del reporte.`,
    'Cerrado': 'El caso fue atendido y cerrado.',
    'Descartado': 'El reporte fue descartado por el operador (falso o duplicado).',
  }

  return (
    <main style={estilos.pagina}>
      <h1 style={{ marginBottom: 4 }}>Reporte enviado ✅</h1>
      <p style={{ marginTop: 0, color: '#57534e' }}>Guarda tu número de radicado.</p>

      <div style={estilos.tarjeta}>
        <p style={{ margin: '0 0 4px', color: '#78716c', fontSize: 14 }}>Número de radicado</p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{reporte.radicado}</p>

        <p style={{ margin: '16px 0 4px', color: '#78716c', fontSize: 14 }}>Hora de recepción</p>
        <p style={{ margin: 0 }}>{new Date(reporte.hora).toLocaleString('es-CO')}</p>

        <p style={{ margin: '16px 0 6px', color: '#78716c', fontSize: 14 }}>Estado</p>
        <span
          style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 999, fontWeight: 700,
            background: COLOR_ESTADO[reporte.estado], color: '#fff',
          }}
        >
          {reporte.estado}
        </span>
        <p style={{ marginBottom: 0 }}>{mensajes[reporte.estado]}</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <button onClick={onNuevo} style={estilos.enviar(false)}>Hacer otro reporte</button>
        <Link to="/" style={{ ...estilos.enlace, alignSelf: 'center' }}>Volver al inicio</Link>
      </div>
    </main>
  )
}

/* ---------- Estilos ---------- */
const estilos = {
  pagina: { maxWidth: 720, margin: '0 auto', padding: 24 },
  enlace: { color: '#b91c1c' },
  seccion: { border: '1px solid #d6d3d1', borderRadius: 10, padding: 16, margin: '16px 0', background: '#fff' },
  leyenda: { fontWeight: 700, padding: '0 8px' },
  rejilla: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 },
  campo: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 },
  etiqueta: { fontSize: 14, fontWeight: 600 },
  input: { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a8a29e', font: 'inherit' },
  error: { color: '#dc2626', fontSize: 13 },
  quitar: {
    position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%',
    border: 'none', background: 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer',
  },
  tarjeta: { background: '#fff', border: '1px solid #d6d3d1', borderRadius: 12, padding: 20 },
  enviar: (deshabilitado) => ({
    padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 16,
    background: '#dc2626', color: '#fff',
    cursor: deshabilitado ? 'not-allowed' : 'pointer',
    opacity: deshabilitado ? 0.45 : 1,
  }),
}