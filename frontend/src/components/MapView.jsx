import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import './MapView.css'

// Fix default marker icon paths for Leaflet in bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FitToMarkers({ positions }) {
  const map = useMap()
  useEffect(() => {
    const pts = (positions || []).filter(p =>
      Number.isFinite(p.latitude) && Number.isFinite(p.longitude) &&
      Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180 &&
      !(p.latitude === 0 && p.longitude === 0)
    )
    if (pts.length === 0) {
      map.setView([-33.9249, 18.4241], 12) // default city view
      return
    }
    const bounds = L.latLngBounds(pts.map(p => [p.latitude, p.longitude]))
    const sw = bounds.getSouthWest(); const ne = bounds.getNorthEast()
    const spanLat = Math.abs(ne.lat - sw.lat)
    const spanLng = Math.abs(ne.lng - sw.lng)
    // If markers слишком разбросаны (вероятно, есть ошибочные 0,0) — показываем дефолтный зум по городу
    if (spanLat > 2 || spanLng > 2) {
      map.setView([-33.9249, 18.4241], 12)
    } else {
      map.fitBounds(bounds.pad(0.2))
    }
  }, [positions, map])
  return null
}

export default function MapView({ places, onSelect }) {
  return (
    <MapContainer className="map-root" center={[-33.9249, 18.4241]} zoom={12} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers positions={places} />
      {places.map(p => (
        <Marker key={p.id} position={[p.latitude, p.longitude]} eventHandlers={{ click: () => onSelect?.(p) }}>
          <Popup>
            <b>{p.name}</b>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
