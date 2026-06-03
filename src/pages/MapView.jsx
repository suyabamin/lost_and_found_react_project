import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/MapView.module.css'
import itemsService from '../services/itemsService'
import { FaSearch, FaPlus, FaMinus, FaLocationArrow, FaLayerGroup, FaDotCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const MapView = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await itemsService.getItems()
      setItems(res.data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Generate random positions for simulation since we don't have lat/lng in DB
  const getSimulatedPos = (id) => {
    const seed = id * 12345
    const x = (Math.abs(Math.sin(seed)) * 80 + 10) + '%'
    const y = (Math.abs(Math.cos(seed)) * 70 + 15) + '%'
    return { left: x, top: y }
  }

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.mapPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <h1>Map View</h1>
            <p>Interactive location-based discovery of lost and found items.</p>
          </div>
          <div className={styles.headerActions}>
            <button className="btn-primary" onClick={() => navigate('/post/create')}>
              <FaPlus /> Report Item
            </button>
          </div>
        </header>

        <div className={styles.mapContainer}>
          <div className={styles.mapBackground} />
          
          <div className={styles.searchBox}>
            <FaSearch color="#64748b" />
            <input 
              type="text" 
              placeholder="Search locations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.mapOverlay}>
            <div className={styles.controlGroup}>
              <button className={styles.mapBtn}><FaPlus /></button>
              <button className={styles.mapBtn}><FaMinus /></button>
            </div>
            <div className={styles.controlGroup}>
              <button className={styles.mapBtn}><FaLocationArrow /></button>
              <button className={styles.mapBtn}><FaLayerGroup /></button>
            </div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.lost}`} /> Lost Items
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.found}`} /> Found Items
            </div>
          </div>

          {filteredItems.map((item) => {
            const pos = getSimulatedPos(item.id)
            return (
              <div 
                key={item.id} 
                className={`${styles.marker} ${styles[item.status]}`}
                style={pos}
                onClick={() => navigate(`/post/${item.id}`)}
              >
                <div className={styles.markerIcon}>
                  <FaDotCircle />
                </div>
                <div className={styles.markerPopup}>
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/200x120'} 
                    alt={item.title} 
                    className={styles.popupImg}
                  />
                  <h4 className={styles.popupTitle}>{item.title}</h4>
                  <div className={styles.popupMeta}>
                    <span>{item.location}</span>
                    <span>{item.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="loading-overlay">
              <p>Loading interactive map...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MapView
