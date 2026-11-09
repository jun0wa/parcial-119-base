// Grupos de emergencia del protocolo de despacho de Bomberos Cali.
// Los colores son una propuesta: el equipo puede cambiarlos, pero deben ser
// los mismos en toda la app y en el mapa 3D.
export const GRUPOS = [
  { codigo: 100, nombre: 'Incendios', color: '#dc2626' },
  { codigo: 200, nombre: 'Explosión o ruptura sin incendio', color: '#ea580c' },
  { codigo: 300, nombre: 'Rescates y emergencias médicas', color: '#2563eb' },
  { codigo: 400, nombre: 'Condiciones peligrosas sin incendio', color: '#ca8a04' },
  { codigo: 500, nombre: 'Llamadas de servicio', color: '#16a34a' },
  { codigo: 800, nombre: 'Clima severo y desastres naturales', color: '#0891b2' },
  { codigo: 900, nombre: 'Tipo de incidente especial, no clasificado', color: '#7c3aed' },
]

export const colorDeGrupo = (codigo) =>
  GRUPOS.find((g) => g.codigo === codigo)?.color ?? '#6b7280'
