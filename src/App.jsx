import { Routes, Route, Link } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Reportar from './pages/Reportar.jsx'
import Operador from './pages/Operador.jsx'

// Las tres pantallas del parcial.
// TODO (estudiantes): envolver las rutas en un Context (o Zustand) con la lista
// de reportes, para que /reportar agregue reportes y /operador los lea.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/reportar" element={<Reportar />} />
      <Route path="/operador" element={<Operador />} />
      <Route path="*" element={<p style={{ padding: 24 }}>Página no encontrada. <Link to="/">Volver</Link></p>} />
    </Routes>
  )
}
