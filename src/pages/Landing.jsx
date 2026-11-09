import { Link } from 'react-router-dom'
import EscenaLanding from '../three/EscenaLanding.jsx'

// TODO (estudiantes): construir la landing completa (sección 4, Pantalla 1 del enunciado).
export default function Landing() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Línea 119 · Bomberos Cali</h1>
      <EscenaLanding />
      <p>Pantalla pendiente: la construye el equipo.</p>
      <Link to="/reportar">Reportar emergencia</Link> · <Link to="/operador">Acceso radio operador</Link>
    </main>
  )
}
