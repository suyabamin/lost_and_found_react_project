import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import NotificationBell from '../components/NotificationBell'
import styles from '../styles/pages/Dashboard.module.css'
import itemsService from '../services/itemsService'
import authService from '../services/authService'
import apiClient from '../services/api'
import { 
  FaHandshake, FaUsers, FaSearch, FaBell, FaHome, 
  FaPlus, FaUser, FaLaptopCode, FaPaw, FaBriefcase, FaKey, 
  FaFileAlt, FaGem, FaList, FaComments, FaComment, FaHandPaper, 
  FaMap, FaHeart, FaShieldAlt, FaChartLine, FaClock, FaArrowRight,
  FaBoxOpen, FaTh, FaTimes, FaMapMarkerAlt, FaShoppingCart, FaExternalLinkAlt,
  FaCalendarAlt, FaStar
} from 'react-icons/fa'

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [stats, setStats] = useState({ active: 0, matches: 0, community: 0 })
  const [loading, setLoading] = useState(true)

  const categories = [
    { name: 'Electronics', icon: FaLaptopCode, id: 'electronics' },
    { name: 'Pets', icon: FaPaw, id: 'pets' },
    { name: 'Bag & Luggage', icon: FaBriefcase, id: 'bag' },
    { name: 'Keys', icon: FaKey, id: 'key' },
    { name: 'Documents', icon: FaFileAlt, id: 'paper' },
    { name: 'Jewelry', icon: FaGem, id: 'jewelry' }
  ]

  const quickLinks = [
    { name: 'Browse', icon: FaList, href: '/browse' },
    { name: 'Create', icon: FaPlus, href: '/post/create' },
    { name: 'Messages', icon: FaComments, href: '/chat' },
    { name: 'Claims', icon: FaHandPaper, href: '/profile/claims' },
    { name: 'Map', icon: FaMap, href: '/map' },
    { name: 'Notifications', icon: FaBell, href: '/notifications' },
    { name: 'Analytics', icon: FaChartLine, href: '/analytics' },
    { name: 'Favorites', icon: FaHeart, href: '/favorites' },
    { name: 'Profile', icon: FaUser, href: '/profile' },
    { name: 'Admin', icon: FaShieldAlt, href: '/admin' }
  ]

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const filters = { 
        ...(filter !== 'all' && { status: filter }),
        ...(searchKeyword && { keyword: searchKeyword })
      }
      const [itemsRes, profileStatsRes, systemStatsRes] = await Promise.all([
        itemsService.getItems(filters),
        authService.getProfileStats().catch(() => ({ data: { total_posts: 0, resolved: 0 } })),
        apiClient.get('/system/stats').catch(() => ({ data: { active_listings: 0, successful_matches: 0, community_members: 0 } }))
      ])
      
      setPosts(itemsRes.data.items || [])
      setStats({
        active: systemStatsRes.data.active_listings,
        matches: systemStatsRes.data.successful_matches,
        community: systemStatsRes.data.community_members
      })
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [filter, searchKeyword])

  useEffect(() => {
    const timer = setTimeout(fetchDashboardData, 400)
    return () => clearTimeout(timer)
  }, [fetchDashboardData])

  return (
    <div className={styles.dashboardPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        {/* App Bar */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.greeting}>
              <h1>Welcome, <b>{user?.name?.split(' ')[0]}</b> 👋</h1>
            </div>
          </div>

          <div className={styles.headerSearch}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search lost or found items..." 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.headerActions}>
            <button 
              className={`${styles.actionIconBtn} ${showQuickActions ? styles.activeHubBtn : ''}`}
              onClick={() => setShowQuickActions(true)}
              title="Quick Access Hub"
            >
              <FaTh />
            </button>
            <NotificationBell />
            <Link to="/profile" className={styles.actionIconBtn} title="My Profile">
              <FaUser />
            </Link>
          </div>
        </header>

        {/* Quick Actions Popup */}
        {showQuickActions && (
          <div className={styles.quickActionsOverlay} onClick={() => setShowQuickActions(false)}>
            <div className={styles.quickActionsPanel} onClick={e => e.stopPropagation()}>
              <div className={styles.panelTitleRow}>
                <h2>Navigation Hub</h2>
                <button className={styles.actionIconBtn} onClick={() => setShowQuickActions(false)}><FaTimes /></button>
              </div>
              <div className={styles.hubGrid}>
                {quickLinks.map(link => (
                  <Link key={link.name} to={link.href} className={styles.hubItem} onClick={() => setShowQuickActions(false)}>
                    <div className={styles.hubIcon}><link.icon /></div>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.contentArea}>
          {/* Stats Section */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaBoxOpen /></div>
              <div className={styles.statInfo}>
                <p>Postings</p>
                <h3>{stats.active}</h3>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaHandshake /></div>
              <div className={styles.statInfo}>
                <p>Recovered</p>
                <h3>{stats.matches}</h3>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaUsers /></div>
              <div className={styles.statInfo}>
                <p>Active Users</p>
                <h3>{stats.community}</h3>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <section className={styles.categorySection}>
            <div className={styles.sectionHeader}>
              <h2>Market Categories</h2>
              <Link to="/browse" className={styles.sectionLink}>
                Explore All <FaArrowRight fontSize="12px" />
              </Link>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.id}`} className={styles.categoryCard}>
                  <div className={styles.catIcon}><cat.icon /></div>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Marketplace Newsfeed */}
          <section className={styles.feedSection}>
            <div className={styles.sectionHeader}>
              <h2>Marketplace Feed</h2>
              <div className={styles.feedFilterRow}>
                {['all', 'lost', 'found'].map(f => (
                  <button 
                    key={f}
                    className={`${styles.feedFilterBtn} ${filter === f ? styles.active : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.ecomGrid}>
              {loading ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="shimmer" style={{height: '380px', borderRadius: 'var(--radius-xl)'}} />)
              ) : posts.length === 0 ? (
                <div className={styles.emptyListing}>
                   <div style={{fontSize: '60px', marginBottom: '20px'}}>🔍</div>
                   <h3>Nothing found yet</h3>
                   <p>No items match your current filters. Try searching for something else or browse all listings.</p>
                   <button className="btn-premium btn-primary" onClick={() => {setFilter('all'); setSearchKeyword('')}}>
                     Browse All Listings
                   </button>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className={styles.productCard} onClick={() => navigate(`/post/${post.id}`)}>
                    <div className={styles.cardImageArea}>
                      <span className={`${styles.statusBadge} ${styles[post.status]}`}>
                        {post.status}
                      </span>
                      <img 
                        src={post.image_url || 'https://via.placeholder.com/400x300?text=No+Image+Available'} 
                        alt={post.title} 
                        className={styles.productImage} 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                      />
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                         <div className={styles.postTime}>
                           <FaClock /> {new Date(post.created_at).toLocaleDateString()}
                         </div>
                      </div>
                      
                      <h3 className={styles.productTitle}>{post.title}</h3>
                      <p className={styles.productDesc}>{post.description}</p>
                      
                      <div className={styles.cardFooter}>
                        <div className={styles.locationInfo}>
                          <FaMapMarkerAlt /> {post.location || 'Unknown'}
                        </div>
                        <button 
                          className={styles.claimBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/post/${post.id}`)
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
