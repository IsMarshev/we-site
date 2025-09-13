import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

export default function MapPicker({ value, onChange, height = 320 }) {
  const [lat, lng] = value || [-33.9249, 18.4241]
  return (
    <div>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <button type="button" onClick={()=>{
          if (!navigator.geolocation) return
          navigator.geolocation.getCurrentPosition((pos)=>{
            onChange([pos.coords.latitude, pos.coords.longitude])
          })
        }}>Моё местоположение</button>
        <span style={{color:'#567'}}>Кликните по карте, чтобы выбрать координаты</span>
      </div>
      <MapContainer center={[lat, lng]} zoom={13} style={{height, width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
        <ClickHandler onChange={onChange} />
        <Marker position={[lat, lng]} draggable eventHandlers={{ dragend: (e)=>{
          const m = e.target
          const p = m.getLatLng()
          onChange([p.lat, p.lng])
        }}} />
      </MapContainer>
    </div>
  )
}

