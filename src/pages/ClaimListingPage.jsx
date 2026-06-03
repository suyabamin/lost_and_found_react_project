import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/BrowseListing.module.css'
import { FaSearch, FaHandHoldingHeart, FaChevronRight, FaArrowRight, FaBoxOpen } from 'react-icons/fa'
import itemsService from '../services/itemsService'

const ClaimListingPage = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchFoundItems()
  }, [])

  const fetchFoundItems = async () => {
    try {
      // Only get "found" items for claiming
      const res = await itemsService.getItems({ status: 'found' })
      setItems(res.data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.browsePage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link to="/dashboard">Home</Link>
            <FaChevronRight className={styles.breadIcon} />
            <span className={styles.activeBread}>Claim Item</span>
          </div>

          <div className={styles.headerContent}>
            <div className={styles.headerIconLarge}>
              <FaHandHoldingHeart />
            </div>
            <div className={styles.pageTitle}>
              <h1>Claim Found Items</h1>
              <p>Found something that belongs to you? Submit a verification form to get it back.</p>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.filterBar}>
             <div className={styles.filterChips}>
                <span className={`${styles.chip} ${styles.active}`}>
                  Available for Claim
                </span>
             </div>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search found items..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
             <div className={styles.emptyState}>
                <h3>Loading items...</h3>
             </div>
          ) : filteredItems.length > 0 ? (
            <div className={styles.listingsGrid}>
              {filteredItems.map((item) => (
                <div key={item.id} className={styles.listingCard}>
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/280x200?text=Found+Item'} 
                    alt={item.title} 
                    className={styles.listingImage}
                    onClick={() => navigate(`/post/${item.id}`)}
                  />
                  <div className={styles.listingBody}>
                    <span className={`${styles.listingBadge} ${styles.found}`}>Found</span>
                    <h3 className={styles.listingTitle}>{item.title}</h3>
                    <div className={styles.listingMeta}>
                      <span>{item.location}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <button 
                       className="btn-primary" 
                       style={{ width: '100%', marginTop: '12px' }}
                       onClick={() => navigate(`/claim/${item.id}`)}
                    >
                      Process Claim <FaArrowRight style={{ marginLeft: '8px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaBoxOpen size={50} color="#cbd5e1" />
              <h3>No found items found</h3>
              <p>There are currently no reported found items available for claim.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ClaimListingPage
