import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import BackButton from '../components/BackButton'
import styles from '../styles/pages/BrowseListing.module.css'
import { 
  FaSearch, FaTimes, FaPlus, FaLaptopCode, FaPaw, FaBriefcase, FaKey, FaFileAlt, FaGem, 
  FaChevronRight, FaMapMarkerAlt, FaClock 
} from 'react-icons/fa'
import itemsService from '../services/itemsService'
import { getLocalItems } from '../utils/localItems'

const browseMeta = {
  electronics: { label: 'Electronics', icon: <FaLaptopCode />, desc: 'Find lost devices, gadgets, and electronics or report found items' },
  pets: { label: 'Pets', icon: <FaPaw />, desc: 'Identify lost pets or help reuniting them with their families' },
  bag: { label: 'Bag & Luggage', icon: <FaBriefcase />, desc: 'Search for lost bags, backpacks, and luggage' },
  key: { label: 'Keys', icon: <FaKey />, desc: 'Find lost keys or report found keychains' },
  paper: { label: 'Documents', icon: <FaFileAlt />, desc: 'Identify lost IDs, passports, and important papers' },
  jewelry: { label: 'Jewelry', icon: <FaGem />, desc: 'Search for lost rings, watches, and precious items' }
}

const BrowseListingPage = () => {
  const { category } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const currentMeta = useMemo(() => category ? browseMeta[category] || { label: category } : null, [category])
  const categoryLabel = currentMeta?.label || ''

  useEffect(() => {
    let mounted = true

    const loadItems = async () => {
      setLoading(true)
      try {
        const response = await itemsService.getItems(categoryLabel ? { category: categoryLabel } : {})
        const data = response.data?.items || response.data?.data || response.data || []
        const apiItems = Array.isArray(data) ? data : []
        if (mounted) {
          setListings(apiItems.length > 0 ? apiItems : getLocalItems())
        }
      } catch {
        if (mounted) {
          setListings(getLocalItems())
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadItems()
    return () => {
      mounted = false
    }
  }, [categoryLabel])

  const filteredListings = listings.filter((listing) => {
    const title = listing.title || ''
    const location = listing.location || ''
    const listingCategory = listing.category || ''
    const matchesFilter = filter === 'all' || listing.status === filter
    const matchesCategory = !categoryLabel || listingCategory.toLowerCase() === categoryLabel.toLowerCase()
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      location.toLowerCase().includes(search.toLowerCase()) ||
      listingCategory.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesCategory && matchesSearch
  })

  return (
    <div className={styles.browsePage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            {currentMeta?.icon && (
              <div className={styles.headerIconLarge}>
                {currentMeta.icon}
              </div>
            )}
            <div className={styles.pageTitle}>
              <h1>{categoryLabel ? `${categoryLabel} Market` : 'Discovery Marketplace'}</h1>
              <p>{currentMeta?.desc || 'Explore recent lost and found listings in the community'}</p>
              <div className={styles.headerStats}>
                 <span><FaClock /> Just Updated</span>
                 <span>• {filteredListings.length} Unique Listings</span>
              </div>
            </div>
            <div className={styles.pageActions}>
              <button className="btn-premium btn-secondary" onClick={() => navigate('/map')}>
                 <FaMapMarkerAlt /> Explore Map
              </button>
              <button className="btn-premium btn-primary" onClick={() => navigate('/post/create')}>
                <FaPlus /> New Listing
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.filterBar}>
            <div className={styles.filterChips}>
              {['all', 'lost', 'found'].map(v => (
                <button
                  key={v}
                  className={`${styles.chip} ${filter === v ? styles.active : ''}`}
                  onClick={() => setFilter(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)} Items
                </button>
              ))}
            </div>

            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by title, location or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.clearBtn} onClick={() => setSearch('')}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.listingsGrid}>
               {Array(4).fill(0).map((_, i) => <div key={i} style={{height: '380px'}} className="premium-card shimmer" />)}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className={styles.listingsGrid}>
              {filteredListings.map((listing) => (
                <Link key={listing.id} to={`/post/${listing.id}`} className={styles.listingCard}>
                  <div className={styles.imageArea}>
                    <span className={`${styles.listingBadge} ${styles[listing.status]}`}>
                      {listing.status}
                    </span>
                    <img
                      src={listing.image_url || 'https://via.placeholder.com/400x300?text=Listing+Image'}
                      alt={listing.title}
                      className={styles.listingImage}
                    />
                  </div>
                  <div className={styles.listingBody}>
                    <h3 className={styles.listingTitle}>{listing.title}</h3>
                    <div className={styles.listingMeta}>
                      <span><FaMapMarkerAlt /> {listing.location}</span>
                      <span><FaClock /> {listing.time || listing.date || 'New'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
               <div style={{fontSize: '50px', marginBottom: '16px'}}>🔭</div>
               <h3>No Listings Found</h3>
               <p>We couldn't find any items matching your current filters in this category.</p>
               <button className="btn-premium btn-primary" style={{marginTop: '20px'}} onClick={() => {setSearch(''); setFilter('all')}}>
                 Reset Discovery Filters
               </button>
            </div>
          )}

          {!loading && filteredListings.length > 8 && (
            <button className={styles.loadMoreBtn}>View More Postings</button>
          )}
        </div>
      </main>
    </div>
  )
}

export default BrowseListingPage
