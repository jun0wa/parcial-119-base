import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'
import { BARRIOS } from '../data/barrios.js'

// Ubicación por defecto: Cali
const CENTRO_CALI = [3.437, -76.522]

// Componente que captura el clic en el mapa usando useMapEvents de react-leaflet
function SelectorPunto({ punto, onPuntoChange, colorPin }) {
  useMapEvents({
    click(e) {
      onPuntoChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  if (!punto) return null

  return (
    <Marker
      position={[punto.lat, punto.lng]}
      icon={crearIcono(colorPin, { seleccionado: true, clases: 'pin--pulso' })}
    >
      <Popup>
        <strong>Punto exacto de la emergencia</strong>
        <br />
        Lat: {punto.lat.toFixed(5)}, Lng: {punto.lng.toFixed(5)}
      </Popup>
    </Marker>
  )
}

// Cuando el usuario elige un barrio en el formulario, el mini mapa vuela hacia él
function CentrarSegunBarrio({ barrioNombre }) {
  const map = useMap()

  useEffect(() => {
    if (!barrioNombre) return
    const barrio = BARRIOS.find((b) => b.nombre === barrioNombre)
    if (barrio) {
      map.flyTo([barrio.lat, barrio.lng], 15, { duration: 0.8 })
    }
  }, [barrioNombre, map])

  return null
}

export default function MiniMapaReporte({
  punto = null,
  onPuntoChange,
  barrioNombre = '',
  colorPin = '#dc2626',
}) {
  return (
    <div style={{ marginTop: 14, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          Punto exacto en el mapa <small style={{ fontWeight: 400, color: '#78716c' }}>(toca el mapa)</small>
        </span>
        {punto && (
          <button
            type="button"
            onClick={() => onPuntoChange(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Quitar marcador
          </button>
        )}
      </div>

      <div
        style={{
          height: 240,
          width: '100%',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid #d6d3d1',
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        <MapContainer
          center={CENTRO_CALI}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CentrarSegunBarrio barrioNombre={barrioNombre} />
          <SelectorPunto punto={punto} onPuntoChange={onPuntoChange} colorPin={colorPin} />
        </MapContainer>
      </div>

      <div style={{ marginTop: 6, fontSize: 13, color: '#57534e' }}>
        {punto ? (
          <span style={{ color: '#15803d', fontWeight: 600 }}>
            📍 Coordenadas fijadas: {punto.lat.toFixed(5)}, {punto.lng.toFixed(5)}
          </span>
        ) : (
          <span>
            👆 Haz clic o toca en el mapa para marcar el punto exacto de la emergencia.
          </span>
        )}
      </div>
    </div>
  )
}
