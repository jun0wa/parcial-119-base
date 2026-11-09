import { createContext, useContext, useState, useEffect } from 'react'
import { BARRIOS } from '../data/barrios.js'

const CLAVE_STORAGE = 'reportes119'

// Matriz de transiciones permitidas: restringe el cambio de estado de cada caso para impedir operaciones inválidas.
export const TRANSICIONES = {
    'Recibido': ['Validado', 'Descartado'],
    'Validado': ['Unidad despachada', 'Descartado'],
    'Unidad despachada': ['Cerrado'],
    'Cerrado': [],
    'Descartado': [],
}

const ReportesContext = createContext(null)

// Lee los reportes almacenados en el navegador y los redirige como valor inicial del estado global.
function leerReportes() {
    try {
        const guardado = localStorage.getItem(CLAVE_STORAGE)
        return guardado ? JSON.parse(guardado) : []
    } catch {
        return []
    }
}

// Proveedor de estado global: centraliza los reportes y sincroniza en tiempo real entre la ciudadanía y el operador.
export function ReportesProvider({ children }) {
    const [reportes, setReportes] = useState(leerReportes)

    // Sincroniza cada actualización de reportes y la redirige a localStorage para persistir los datos.
    useEffect(() => {
        try {
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(reportes))
        } catch {
            // Continúa en memoria si el almacenamiento local está saturado o restringido.
        }
    }, [reportes])

    // Registra un nuevo reporte: prioriza las coordenadas fijadas en el mini mapa y lo redirige a la lista activa.
    function agregarReporte(datos) {
        const barrio = BARRIOS.find((b) => b.nombre === datos.barrio)
        const id = Date.now()

        const nuevo = {
            ...datos,
            id,
            radicado: `119-${String(id).slice(-6)}`,
            hora: new Date().toISOString(),
            estado: 'Recibido',
            grupo: Number(datos.grupo),
            // Si el ciudadano tocó el mini mapa, se redirige esa coordenada exacta; de lo contrario, usa el centro del barrio.
            lat: datos.lat ?? barrio?.lat,
            lng: datos.lng ?? barrio?.lng,
            fotos: datos.fotos ?? [],
            unidad: null,
        }

        setReportes((prev) => [...prev, nuevo])
        return id
    }

    // Valida y actualiza el estado de un reporte, redirigiendo los cambios al mapa y panel del radio operador.
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

// Hook de consumo: expone los reportes y métodos de actualización hacia cualquier pantalla de la aplicación.
export function useReportes() {
    const ctx = useContext(ReportesContext)
    if (!ctx) throw new Error('useReportes debe usarse dentro de <ReportesProvider>')
    return ctx
}
