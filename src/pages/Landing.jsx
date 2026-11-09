import { Link } from 'react-router-dom'
import EscenaLanding from '../three/EscenaLanding.jsx'
import TarjetaGrupo from '../components/TarjetaGrupo.jsx'
import { GRUPOS } from '../data/grupos.js'

// Ubicación en el proyecto: src/pages/Landing.jsx

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ---------- Encabezado ---------- */}
      <header style={estilos.encabezado}>
        <span style={{ fontSize: 24 }} aria-hidden="true">🚒</span>
        <div>
          <strong style={{ display: 'block', lineHeight: 1.1 }}>Bomberos Voluntarios de Cali</strong>
          <small style={{ opacity: 0.85 }}>Línea 119</small>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* ---------- Hero: llamado + botones + escena 3D ---------- */}
        <section style={estilos.hero}>
          <div style={estilos.heroContenido}>
            {/* Primero el texto y los botones: así siempre quedan visibles sin hacer scroll,
                incluso en celular, donde la escena 3D queda debajo */}
            <div>
              <p style={estilos.etiqueta}>CANAL DIGITAL · LÍNEA 119</p>
              <h1 style={estilos.titulo}>¿Tienes una emergencia?</h1>
              <p style={estilos.subtitulo}>
                Repórtala en segundos con tu ubicación y fotos. Un radio operador recibirá tu aviso
                al instante y te confirmará el estado de tu reporte.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                <Link to="/reportar" style={estilos.botonPrimario}>
                  Reportar emergencia
                </Link>
                <a href="tel:119" style={estilos.botonSecundario}>
                  📞 Llamar al 119
                </a>
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <EscenaLanding />
            </div>
          </div>
        </section>

        {/* ---------- Tarjetas de los siete grupos ---------- */}
        <section style={estilos.seccion}>
          <h2 style={{ marginTop: 0 }}>¿Qué tipo de emergencia es?</h2>
          <p style={{ color: '#57534e', marginTop: 0 }}>
            Estos son los siete grupos con los que Bomberos clasifica cada reporte.
          </p>
          <div style={estilos.rejilla}>
            {GRUPOS.map((g) => (
              <TarjetaGrupo key={g.codigo} codigo={g.codigo} nombre={g.nombre} color={g.color} />
            ))}
          </div>
        </section>
      </main>

      {/* ---------- Pie de página ---------- */}
      <footer style={estilos.pie}>
        <span>Prototipo académico · datos de prueba ficticios</span>
        <Link to="/operador" style={{ color: '#fca5a5' }}>Acceso radio operador</Link>
      </footer>
    </div>
  )
}

/* ---------- Estilos ---------- */
const estilos = {
  encabezado: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px',
    background: '#7f1d1d', color: '#fff',
  },
  hero: {
    background: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)',
    color: '#fff', padding: '32px 24px',
  },
  heroContenido: {
    maxWidth: 1100, margin: '0 auto', display: 'grid', alignItems: 'center', gap: 24,
    // En pantalla ancha: dos columnas. En celular: una sola, apiladas.
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  },
  etiqueta: { margin: 0, fontSize: 13, letterSpacing: 2, color: '#fca5a5', fontWeight: 700 },
  titulo: { margin: '8px 0 12px', fontSize: 'clamp(32px, 6vw, 52px)', lineHeight: 1.1 },
  subtitulo: { margin: 0, fontSize: 18, maxWidth: 520, color: '#fee2e2' },
  botonPrimario: {
    padding: '16px 28px', borderRadius: 10, background: '#fff', color: '#991b1b',
    fontWeight: 800, fontSize: 18, textDecoration: 'none',
  },
  botonSecundario: {
    padding: '16px 28px', borderRadius: 10, border: '2px solid #fff', color: '#fff',
    fontWeight: 700, fontSize: 18, textDecoration: 'none',
  },
  seccion: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  rejilla: {
    display: 'grid', gap: 14,
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  },
  pie: {
    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
    padding: '16px 24px', background: '#1c1917', color: '#d6d3d1', fontSize: 14,
  },
}