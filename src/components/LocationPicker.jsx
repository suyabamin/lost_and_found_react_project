import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { FaMapMarkerAlt, FaTimes, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

// Red icon for the picker
const pickerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41]
})

// Click-to-place inner component
const ClickHandler = ({ onPlace }) => {
  useMapEvents({ click: (e) => onPlace(e.latlng) })
  return null
}

// Center-to effect
const CenterTo = ({ position }) => {
  const map = useMap()
  const prev = useRef(null)
  useEffect(() => {
    if (!position) return
    const key = `${position.lat},${position.lng}`
    if (prev.current !== key) {
      prev.current = key
      map.setView([position.lat, position.lng], map.getZoom())
    }
  }, [position, map])
  return null
}

const LocationPicker = ({ initialLat, initialLng, onChange, onAddressFetch }) => {
  const [position, setPosition] = useState(
    initialLat && initialLng ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) } : null
  )
  const [address, setAddress] = useState('')
  const [fetching, setFetching] = useState(false)

  const fetchAddress = async (lat, lng) => {
    setFetching(true)
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      const data = response.data
      if (data && data.display_name) {
        setAddress(data.display_name)
        if (onAddressFetch) {
          onAddressFetch({
            full_address: data.display_name,
            details: data.address
          })
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error)
    } finally {
      setFetching(false)
    }
  }

  const handlePlace = (latlng) => {
    setPosition(latlng)
    fetchAddress(latlng.lat, latlng.lng)
    if (onChange) onChange({ lat: latlng.lat, lng: latlng.lng })
  }

  const clearPosition = (e) => {
    e.stopPropagation()
    setPosition(null)
    setAddress('')
    if (onChange) onChange(null)
    if (onAddressFetch) onAddressFetch(null)
  }

  const defaultCenter = position
    ? [position.lat, position.lng]
    : [23.7104, 90.4074]  // Dhaka

  return (
    <div>
      <div style={{
        height: '260px', width: '100%', borderRadius: '12px',
        overflow: 'hidden', border: '1px solid #e2e8f0',
        position: 'relative', cursor: 'crosshair'
      }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPlace={handlePlace} />
          {position && (
            <>
              <Marker position={[position.lat, position.lng]} icon={pickerIcon} />
              <CenterTo position={position} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Address / Coordinate display */}
      <div style={{
        padding: '12px', background: position ? '#f0fdf4' : '#f8fafc',
        borderRadius: '8px', marginTop: '8px',
        border: `1px solid ${position ? '#86efac' : '#e2e8f0'}`,
        fontSize: '13px', transition: 'all 0.2s'
      }}>
        {fetching ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
            <FaSpinner className="animate-spin" /> Fetching location details...
          </div>
        ) : position ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaMapMarkerAlt /> Selected Location
              </span>
              <button
                type="button"
                onClick={clearPosition}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: '#1e293b', margin: '0 0 4px 0', lineHeight: '1.4' }}>{address}</p>
            <code style={{ fontSize: '11px', color: '#64748b' }}>
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </code>
          </div>
        ) : (
          <span style={{ color: '#94a3b8' }}>
            📍 Click on the map to drop a pin and auto-fill address
          </span>
        )}
      </div>
    </div>
  )
}

export default LocationPicker
