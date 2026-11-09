import { createContext, useContext, useState, useEffect } from 'react'
import { BARRIOS } from '../data/barrios.js'

// Ubicación en el proyecto: src/context/ReportesContext.jsx

const CLAVE_STORAGE = 'reportes119'

// Flujo permitido: de qué estado a cuáles se puede pasar.
// Esto es lo que impide "despachar sin validar".
export const TRANSICIONES = {
    'Recibido': ['Validado', 'Descartado'],
    'Validado': ['Unidad despachada', 'Descartado'],
    'Unidad despachada': ['Cerrado'],
    'Cerrado': [],
    'Descartado': [],
}

const ReportesContext = createContext(null)

// Lee los reportes guardados; si no hay nada (o está dañado), devuelve [].
function leerReportes() {
    try {
        const guardado = localStorage.getItem(CLAVE_STORAGE)
        return guardado ? JSON.parse(guardado) : []
    } catch {
        return []
    }
}

export function ReportesProvider({ children }) {
    // Se pasa una FUNCIÓN a useState: así localStorage se lee solo una vez, al inicio.
    const [reportes, setReportes] = useState(leerReportes)

    // Cada vez que cambia la lista, se guarda.
    useEffect(() => {
        try {
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(reportes))
        } catch {
            // si el almacenamiento está lleno o bloqueado, la app sigue funcionando en memoria
        }
    }, [reportes])

    // Crea un reporte nuevo. `datos` viene del formulario del ciudadano:
    // { nombres, apellidos, telefono, grupo, queVe, direccion, barrio,
    //   referencia, edificio, fotos }
    // Devuelve el id para poder mostrar la confirmación de ese reporte.
    function agregarReporte(datos) {
        const barrio = BARRIOS.find((b) => b.nombre === datos.barrio)
        const id = Date.now()

        const nuevo = {
            ...datos,
            id,
            radicado: `119-${String(id).slice(-6)}`,
            hora: new Date().toISOString(), // se formatea al mostrarla
            estado: 'Recibido',
            grupo: Number(datos.grupo), // el <select> entrega texto; el mapa compara con números
            lat: datos.lat ?? barrio?.lat,
            lng: datos.lng ?? barrio?.lng,
            fotos: datos.fotos ?? [],
            unidad: null,
        }

        setReportes((prev) => [...prev, nuevo])
        return id
    }

    // Cambia el estado de un reporte respetando TRANSICIONES.
    // `extra` permite guardar datos adicionales, por ejemplo:
    //   cambiarEstado(id, 'Validado', { grupo: 300 })
    //   cambiarEstado(id, 'Unidad despachada', { unidad: 'Ambulancia' })
    // Devuelve true si el cambio se aplicó y false si no estaba permitido.
    function cambiarEstado(id, nuevoEstado, extra = {}) {
        const actual = reportes.find((r) => r.id === id)
        if (!actual || !TRANSICIONES[actual.estado]?.includes(nuevoEstado)) return false

        setReportes((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...extra, estado: nuevoEstado } : r))
        )
        return true
    }

    return (
        <ReportesContext.Provider value={{ reportes, agregarReporte, cambiarEstado }}>
            {children}
        </ReportesContext.Provider>
    )
}

// Hook para usar el contexto en cualquier pantalla.
export function useReportes() {
    const ctx = useContext(ReportesContext)
    if (!ctx) throw new Error('useReportes debe usarse dentro de <ReportesProvider>')
    return ctx
}