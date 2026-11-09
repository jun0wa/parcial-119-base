// Ubicación en el proyecto: src/components/TarjetaGrupo.jsx  (crea la carpeta components)

// Tarjeta de un grupo de emergencia: código, nombre y el color del grupo.
// Props:
//   codigo: número del grupo (100, 200, ...)
//   nombre: nombre del grupo
//   color: color del grupo (viene de data/grupos.js, el mismo que usa el mapa)
export default function TarjetaGrupo({ codigo, nombre, color }) {
    return (
        <article
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#fff', border: '1px solid #e7e5e4', borderTop: `6px solid ${color}`,
                borderRadius: 12, padding: 16,
            }}
        >
            <span
                style={{
                    flexShrink: 0, width: 56, height: 56, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: color, color: '#fff', fontWeight: 800, fontSize: 18,
                }}
            >
                {codigo}
            </span>
            <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.3 }}>{nombre}</h3>
        </article>
    )
}