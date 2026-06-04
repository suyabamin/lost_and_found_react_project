import { useState, useEffect, useMemo, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/MapView.module.css'
import itemsService from '../services/itemsService'
import messagingService from '../services/messagingService'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import {
  FaSearch, FaPlus, FaLocationArrow, FaDotCircle,
  FaInfoCircle, FaComment, FaHandPaper, FaExternalLinkAlt,
  FaFilter, FaTimes, FaListUl, FaMapMarkerAlt, FaSpinner
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Circle } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'

// ── Custom marker icons ──────────────────────────────────────────────────────
const CDN = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img'
const SHADOW = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
const mkIcon = (color) => new L.Icon({
  iconUrl: `${CDN}/marker-icon-2x-${color}.png`,
  shadowUrl: SHADOW,
  iconSize: [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41]
})
const lostIcon  = mkIcon('red')
const foundIcon = mkIcon('green')
const userIcon  = mkIcon('blue')

// ── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ── Stable "fly to" helper – avoids re-render loop ──────────────────────────
const FlyTo = ({ center, zoom }) => {
  const map = useMap()
  const prev = useRef(null)
  useEffect(() => {
    const key = `${center[0]},${center[1]},${zoom}`
    if (prev.current !== key) {
      prev.current = key
      map.flyTo(center, zoom, { animate: true, duration: 1 })
    }
  }, [center, zoom, map])
  return null
}

// ── Main Component ───────────────────────────────────────────────────────────
const MapView = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [items,          setItems]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter,     setDateFilter]     = useState('')
  const [userLocation,   setUserLocation]   = useState(null)
  const [nearbyRadius,   setNearbyRadius]   = useState(null)   // 1 / 5 / 10 km
  const [showNearby,     setShowNearby]     = useState(false)
  const [locating,       setLocating]       = useState(false)
  const [flyTarget, setFlyTarget] = useState({ center: [23.7104, 90.4074], zoom: 12 })

  // ── data ──
  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await itemsService.getItems()
      const valid = (res.data.items || []).filter(i => i.latitude && i.longitude)
      setItems(valid)
    } catch (err) {
      console.error(err)
      setError('Failed to load items. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── geolocation ──
  const findMyLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire('Not Supported', 'Geolocation is not supported by your browser.', 'warning')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = [coords.latitude, coords.longitude]
        setUserLocation(pos)
        setFlyTarget({ center: pos, zoom: 15 })
        setLocating(false)
      },
      () => {
        setLocating(false)
        Swal.fire('Location Denied', 'Could not get your location. Please allow access in browser settings.', 'error')
      },
      { timeout: 10000 }
    )
  }

  // ── derived data ──
  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean))
    return ['all', ...Array.from(cats).sort()]
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q)
      const matchStatus   = statusFilter   === 'all' || item.status   === statusFilter
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchDate     = !dateFilter    || (item.created_at || '').startsWith(dateFilter)
      return matchSearch && matchStatus && matchCategory && matchDate
    })
  }, [items, search, statusFilter, categoryFilter, dateFilter])

  const nearbyItems = useMemo(() => {
    if (!userLocation || !nearbyRadius) return []
    return filteredItems
      .map(item => ({
        ...item,
        distance: haversine(userLocation[0], userLocation[1],
          parseFloat(item.latitude), parseFloat(item.longitude))
      }))
      .filter(item => item.distance <= nearbyRadius)
      .sort((a, b) => a.distance - b.distance)
  }, [filteredItems, userLocation, nearbyRadius])

  // ── chat handler ──
  const handleStartChat = async (itemId) => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'You must be logged in to chat.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login'
      }).then(r => r.isConfirmed && navigate('/login'))
      return
    }
    try {
      const res = await messagingService.createConversation(itemId)
      navigate(`/chat/${res.data.id}`)
    } catch (err) {
      Swal.fire('Error', 'Could not start chat. Try again.', 'error')
    }
  }

  const openInGoogleMaps = (lat, lng) =>
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setDateFilter('')
    setNearbyRadius(null)
  }
  const hasActiveFilters = search || statusFilter !== 'all' || categoryFilter !== 'all' || dateFilter || nearbyRadius

  // ── render ──
  return (
    <div className={styles.mapPage}>
      <Sidebar />
      <main className={styles.mainContent}>

        {/* ── Header ── */}
        <header className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <h1>Interactive Map</h1>
            <p>
              {loading ? 'Loading items…' : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} on map`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Status</option>
              <option value="lost">🔴 Lost</option>
              <option value="found">🟢 Found</option>
            </select>
            {/* Category */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={selectStyle}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
            {/* Date */}
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{ ...selectStyle, width: '140px' }}
              title="Filter by date"
            />
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{ ...selectStyle, cursor: 'pointer', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <FaTimes /> Clear
              </button>
            )}
            <button
              style={{ ...btnStyle, background: '#0f172a' }}
              onClick={() => navigate('/post/create')}
            >
              <FaPlus /> Report Item
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden', minHeight: '520px' }}>

          {/* ── Map ── */}
          <div className={styles.mapContainer} style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', position: 'relative', minHeight: '520px' }}>

            {/* Search overlay */}
            <div className={styles.searchBox} style={{ zIndex: 800 }}>
              <FaSearch color="#64748b" />
              <input
                type="text"
                placeholder="Search items or locations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <FaTimes style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearch('')} />}
            </div>

            {/* My Location button */}
            <div className={styles.mapOverlay} style={{ zIndex: 800 }}>
              <div className={styles.controlGroup}>
                <button className={styles.mapBtn} onClick={findMyLocation} title="Find My Location" disabled={locating}>
                  {locating ? <FaSpinner className="spin" /> : <FaLocationArrow />}
                </button>
                <button
                  className={styles.mapBtn}
                  onClick={() => { setShowNearby(!showNearby); if (!userLocation) findMyLocation() }}
                  title="Nearby Items"
                  style={{ background: showNearby ? '#14b8a6' : 'white', color: showNearby ? 'white' : '#1e293b' }}
                >
                  <FaListUl />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className={styles.legend} style={{ zIndex: 800 }}>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.lost}`} />
                Lost ({filteredItems.filter(i => i.status === 'lost').length})
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.found}`} />
                Found ({filteredItems.filter(i => i.status === 'found').length})
              </div>
              {userLocation && (
                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: '#3b82f6' }} />
                  You
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 900 }}>
                <div style={{ textAlign: 'center' }}>
                  <FaSpinner className="spin" size={30} color="#14b8a6" />
                  <p style={{ marginTop: '10px', color: '#64748b' }}>Loading map items…</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 900 }}>
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p style={{ color: '#ef4444', fontWeight: '600' }}>{error}</p>
                  <button style={btnStyle} onClick={fetchItems}>Retry</button>
                </div>
              </div>
            )}

            <MapContainer
              center={flyTarget.center}
              zoom={flyTarget.zoom}
              zoomControl={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ZoomControl position="bottomright" />
              <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />

              {/* Nearby radius circle */}
              {userLocation && nearbyRadius && (
                <Circle
                  center={userLocation}
                  radius={nearbyRadius * 1000}
                  pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.06, weight: 2, dashArray: '6 4' }}
                />
              )}

              {/* Item markers with clustering */}
              <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
                {filteredItems.map(item => (
                  <Marker
                    key={item.id}
                    position={[parseFloat(item.latitude), parseFloat(item.longitude)]}
                    icon={item.status === 'lost' ? lostIcon : foundIcon}
                  >
                    <Popup minWidth={250} maxWidth={260}>
                      <div style={{ padding: '12px' }}>
                        <img
                          src={item.image_url || 'https://placehold.co/260x120?text=No+Photo'}
                          alt={item.title}
                          style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                          onError={e => { e.target.src = 'https://placehold.co/260x120?text=No+Photo' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                            background: item.status === 'lost' ? '#fef2f2' : '#f0fdf4',
                            color: item.status === 'lost' ? '#dc2626' : '#16a34a'
                          }}>
                            {item.status === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>• {item.category}</span>
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{item.title}</h4>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaMapMarkerAlt size={10} /> {item.location}
                        </p>
                        <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#94a3b8' }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button className="map-popup-btn map-popup-btn-primary" onClick={() => navigate(`/post/${item.id}`)}>
                            <FaInfoCircle /> View Details
                          </button>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="map-popup-btn map-popup-btn-chat" onClick={() => handleStartChat(item.id)}>
                              <FaComment /> Chat
                            </button>
                            <button className="map-popup-btn map-popup-btn-claim" onClick={() => navigate(`/claim/${item.id}`)}>
                              <FaHandPaper /> Claim
                            </button>
                          </div>
                          <button className="map-popup-btn map-popup-btn-maps" onClick={() => openInGoogleMaps(item.latitude, item.longitude)}>
                            <FaExternalLinkAlt /> Open in Google Maps
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>

              {/* User location marker */}
              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>📍 You are here</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* ── Nearby Items Sidebar ── */}
          {showNearby && (
            <div style={{
              width: '300px', flexShrink: 0, background: 'white', borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px' }}>
                  <FaMapMarkerAlt color="#14b8a6" /> Nearby Items
                </h3>
                {!userLocation ? (
                  <button style={btnStyle} onClick={findMyLocation}>
                    <FaLocationArrow /> Find My Location
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[1, 5, 10].map(km => (
                      <button
                        key={km}
                        onClick={() => setNearbyRadius(nearbyRadius === km ? null : km)}
                        style={{
                          padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          cursor: 'pointer', border: '1px solid',
                          background: nearbyRadius === km ? '#14b8a6' : 'white',
                          color: nearbyRadius === km ? 'white' : '#14b8a6',
                          borderColor: '#14b8a6'
                        }}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {!userLocation ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '13px' }}>
                    Enable location to see nearby items.
                  </p>
                ) : !nearbyRadius ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '13px' }}>
                    Select a radius above.
                  </p>
                ) : nearbyItems.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '13px' }}>
                    No items within {nearbyRadius} km.
                  </p>
                ) : (
                  nearbyItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/post/${item.id}`)}
                      style={{
                        display: 'flex', gap: '10px', padding: '10px', borderRadius: '10px',
                        cursor: 'pointer', marginBottom: '6px', transition: 'background 0.2s',
                        border: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <img
                        src={item.image_url || 'https://placehold.co/50x50?text=Item'}
                        alt={item.title}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        onError={e => { e.target.src = 'https://placehold.co/50x50?text=Item' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </p>
                        <p style={{ margin: '0', fontSize: '11px', color: '#64748b' }}>
                          <span style={{ color: item.status === 'lost' ? '#dc2626' : '#16a34a', fontWeight: '600' }}>
                            {item.status.toUpperCase()}
                          </span>
                          {' · '}{item.distance.toFixed(1)} km away
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Inline style helpers
const selectStyle = {
  padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
  outline: 'none', fontSize: '13px', cursor: 'pointer', background: 'white',
  color: '#1e293b'
}
const btnStyle = {
  padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: 'white',
  fontWeight: '600', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px'
}

export default MapView
