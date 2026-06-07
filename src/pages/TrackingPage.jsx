import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { FaChevronLeft, FaCheckCircle, FaMapMarkerAlt, FaRoute, FaLocationArrow, FaSpinner } from 'react-icons/fa'
import trackingService from '../services/trackingService'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/pages/TrackingPage.module.css'
import Swal from 'sweetalert2'

// Custom markers
const ownerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

const claimantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

// Routing component
const Routing = ({ from, to }) => {
  const map = useMap()
  const routingControlRef = useRef(null)

  useEffect(() => {
    if (!map || !from || !to) return

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current)
    }

    try {
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(from[0], from[1]),
          L.latLng(to[0], to[1])
        ],
        lineOptions: {
          styles: [{ color: '#14b8a6', weight: 4, opacity: 0.7 }]
        },
        createMarker: () => null, // We handle markers manually
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false
      }).addTo(map)
    } catch (e) {
      console.error('Routing error:', e)
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
      }
    }
  }, [map, from, to])

  return null
}

const TrackingPage = () => {
  const { sessionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [distance, setDistance] = useState(null)
  const [sessionError, setSessionError] = useState(null)
  const [locationError, setLocationError] = useState(null)

  const pollingRef = useRef(null)

  useEffect(() => {
    fetchSession()
    requestLocationPermission()

    pollingRef.current = setInterval(() => {
      syncLocation()
      fetchSession(false)
    }, 5000)

    return () => clearInterval(pollingRef.current)
  }, [sessionId])

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Location sharing is disabled.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationError(null)
        console.log('Location access granted')
      },
      (err) => {
        console.warn('Location denied:', err.message)
        if (err.code === 1) {
          setLocationError('GPS access denied. Your location will not be shared, but you can still view the session.')
        } else if (err.code === 2) {
          setLocationError('Location unavailable. Your GPS may be off.')
        } else {
          setLocationError('Location request timed out.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const syncLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        trackingService.updateLocation(latitude, longitude).catch(err => console.error('Loc update err:', err))
      })
    }
  }

  const fetchSession = async (firstLoad = true) => {
    try {
      if (firstLoad) setLoading(true)
      const res = await trackingService.getSession(sessionId)
      setSession(res.data.session)
      
      if (res.data.session.owner_lat && res.data.session.claimant_lat) {
          const d = calculateDistance(
              res.data.session.owner_lat, res.data.session.owner_lng,
              res.data.session.claimant_lat, res.data.session.claimant_lng
          )
          setDistance(d)
      }
    } catch (err) {
      console.error(err)
      if (firstLoad) setSessionError('Failed to load tracking session. Please go back and try again.')
    } finally {
      if (firstLoad) setLoading(false)
    }
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d > 1 ? `${d.toFixed(1)} KM` : `${(d * 1000).toFixed(0)} Meters`;
  }

  const handleComplete = async () => {
      const result = await Swal.fire({
          title: 'Item Returned?',
          text: 'Only confirm if the item has been physically returned.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Yes, Completed!'
      })

      if (result.isConfirmed) {
          navigate(`/return-item/${sessionId}`)
      }
  }

  if (loading) return <div className="loading-screen"><FaSpinner className="animate-spin" /></div>
  if (sessionError) return <div className="error-screen">{sessionError}</div>
  if (!session) return <div>Session not found.</div>

  const isOwner = Number(user.id) === Number(session.owner_id)
  const otherUser = isOwner ? { 
      name: session.claimant_name, 
      avatar: session.claimant_avatar, 
      role: 'Claimant', 
      lat: session.claimant_lat, 
      lng: session.claimant_lng 
  } : { 
      name: session.owner_name, 
      avatar: session.owner_avatar, 
      role: 'Owner', 
      lat: session.owner_lat, 
      lng: session.owner_lng 
  }

  const myData = isOwner ? { lat: session.owner_lat, lng: session.owner_lng } : { lat: session.claimant_lat, lng: session.claimant_lng }

  return (
    <div className={styles.trackingPage}>
      <div className={styles.leftPanel}>
        <div className={styles.panelHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <FaChevronLeft /> Back
          </button>
          <h1>Live Tracking</h1>
          {locationError && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px'
            }}>
              <FaLocationArrow style={{ flexShrink: 0 }} />
              {locationError}
            </div>
          )}
          <div className={styles.itemInfo}>
            <img src={session.item_image} className={styles.itemThumb} alt="" />
            <div>
              <p style={{fontWeight: '600', margin: 0}}>{session.item_title}</p>
              <p style={{fontSize: '12px', color: '#64748b', margin: 0}}>Session #{session.id}</p>
            </div>
          </div>
        </div>

        <div className={styles.panelContent}>
          <div className={styles.userCard}>
            <div className={styles.roleLabel}>My Status</div>
            <div className={styles.userHeader}>
              <img src={user.avatar} className={styles.avatar} alt="" />
              <div>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.statusIndicator}>
                  <span className={`${styles.dot} ${styles.online}`}></span>
                  Sharing Live Location
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.userCard} ${!otherUser.lat ? styles.waiting : ''}`}>
            <div className={styles.roleLabel}>{otherUser.role}</div>
            <div className={styles.userHeader}>
              <img src={otherUser.avatar} className={styles.avatar} alt="" />
              <div>
                <div className={styles.userName}>{otherUser.name}</div>
                <div className={styles.statusIndicator}>
                  <span className={`${styles.dot} ${otherUser.lat ? styles.online : styles.offline}`}></span>
                  {otherUser.lat ? 'Active Now' : 'Waiting for connection...'}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Distance to each other</span>
              <span className={styles.statValue}>{distance || 'Calculating...'}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Tracking Mode</span>
              <span className={styles.statValue} style={{fontSize: '18px'}}><FaRoute /> Walking</span>
            </div>
          </div>
        </div>

        <div className={styles.footerActions}>
          {session.status === 'active' && (
            <button className={styles.completeBtn} onClick={handleComplete}>
              <FaCheckCircle /> Confirm Item Return
            </button>
          )}
          {session.status === 'completed' && (
            <div style={{textAlign: 'center', color: '#10b981', fontWeight: 'bold'}}>
              Session Completed
            </div>
          )}
        </div>
      </div>

      <div className={styles.rightPanel}>
        <MapContainer 
            center={[session.owner_lat || 23.71, session.owner_lng || 90.4]} 
            zoom={15} 
            className={styles.mapContainer}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {session.owner_lat && (
            <Marker position={[session.owner_lat, session.owner_lng]} icon={ownerIcon}>
              <Popup>Owner: {session.owner_name}</Popup>
            </Marker>
          )}

          {session.claimant_lat && (
            <Marker position={[session.claimant_lat, session.claimant_lng]} icon={claimantIcon}>
              <Popup>Claimant: {session.claimant_name}</Popup>
            </Marker>
          )}

          {session.owner_lat && session.claimant_lat && (
            <Routing 
                from={[session.owner_lat, session.owner_lng]} 
                to={[session.claimant_lat, session.claimant_lng]} 
            />
          )}
          
          <AutoCenter myPos={myData} otherPos={otherUser} />
        </MapContainer>
      </div>
    </div>
  )
}

const AutoCenter = ({ myPos, otherPos }) => {
    const map = useMap()
    useEffect(() => {
        if (myPos.lat && otherPos.lat) {
            const bounds = L.latLngBounds([
                [myPos.lat, myPos.lng],
                [otherPos.lat, otherPos.lng]
            ])
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (myPos.lat) {
            map.setView([myPos.lat, myPos.lng], 15)
        }
    }, [myPos.lat, otherPos.lat])
    return null
}

export default TrackingPage
