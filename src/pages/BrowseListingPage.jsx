import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/BrowseListing.module.css'
import { FaSearch, FaTimes, FaPlus, FaLaptopCode, FaPaw, FaBriefcase, FaKey, FaFileAlt, FaGem, FaChevronRight } from 'react-icons/fa'
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
    const matchesCategory = !categoryLabel || listingCategory === categoryLabel
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
          <div className={styles.breadcrumb}>
            <Link to="/dashboard">Home</Link>
            <FaChevronRight className={styles.breadIcon} />
            <span className={styles.activeBread}>{categoryLabel || 'Browse Listings'}</span>
          </div>

          <div className={styles.headerContent}>
            {currentMeta?.icon && (
              <div className={styles.headerIconLarge}>
                {currentMeta.icon}
              </div>
            )}
            <div className={styles.pageTitle}>
              <h1>{categoryLabel ? `${categoryLabel} Listings` : 'Browse Listings'}</h1>
              <p>{currentMeta?.desc || 'Search and browse lost and found items in your area'}</p>
              {categoryLabel && (
                <div className={styles.headerStats}>
                  <span><FaPlus style={{ fontSize: '10px' }} /> Updated just now</span>
                  <span>• {filteredListings.length} active listings</span>
                </div>
              )}
            </div>
            <div className={styles.pageActions}>
              <button className={styles.actionBtn} onClick={() => navigate('/map')}>View Map</button>
              <button className={styles.actionBtn} onClick={() => navigate('/post/create')}>
                <FaPlus /> Post Item
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.filterBar}>
            <div className={styles.filterChips}>
              <button
                className={`${styles.chip} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
              >
                All Items
              </button>
              <button
                className={`${styles.chip} ${filter === 'lost' ? styles.active : ''}`}
                onClick={() => setFilter('lost')}
              >
                Lost Items
              </button>
              <button
                className={`${styles.chip} ${filter === 'found' ? styles.active : ''}`}
                onClick={() => setFilter('found')}
              >
                Found Items
              </button>
            </div>

            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear search">
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <h3>Loading listings...</h3>
              <p>Please wait while items are loaded.</p>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className={styles.listingsGrid}>
              {filteredListings.map((listing) => (
                <Link key={listing.id} to={`/post/${listing.id}`} className={styles.listingCard}>
                  <img
                    src={listing.image_url || 'https://via.placeholder.com/280x200?text=Item'}
                    alt={listing.title}
                    className={styles.listingImage}
                  />
                  <div className={styles.listingBody}>
                    <span className={`${styles.listingBadge} ${styles[listing.status]}`}>
                      {listing.status === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <h3 className={styles.listingTitle}>{listing.title}</h3>
                    <div className={styles.listingMeta}>
                      <span>{listing.location}</span>
                      <span>{listing.time || listing.date || 'Recently'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}

          {!loading && filteredListings.length > 0 && (
            <button className={styles.loadMoreBtn}>Load more listings</button>
          )}
        </div>
      </main>
    </div>
  )
}

export default BrowseListingPage
