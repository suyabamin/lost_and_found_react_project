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
  FaBoxOpen, FaTh, FaTimes, FaMapMarkerAlt, FaShoppingCart, FaExternalLinkAlt
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
              <h1 style={{fontSize: '16px'}}>Welcome back, <b>{user?.name?.split(' ')[0]}</b></h1>
            </div>
          </div>

          <div className={styles.headerSearch}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search items by name, location or description..." 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.headerActions}>
            <button 
              className={`${styles.actionIconBtn} ${showQuickActions ? styles.activeHubBtn : ''}`}
              onClick={() => setShowQuickActions(true)}
            >
              <FaTh />
            </button>
            <NotificationBell />
            <Link to="/profile" className={styles.actionIconBtn}>
              <FaUser />
            </Link>
          </div>
        </header>

        {/* Quick Actions Popup */}
        {showQuickActions && (
          <div className={styles.quickActionsOverlay} onClick={() => setShowQuickActions(false)}>
            <div className={styles.quickActionsPanel} onClick={e => e.stopPropagation()}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '24px'}}>
                <h2 style={{margin: 0, fontSize: '20px'}}>Quick Access</h2>
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
                <h3>{stats.active}</h3>
                <p>Active Items</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaHandshake /></div>
              <div className={styles.statInfo}>
                <h3>{stats.matches}</h3>
                <p>Recovered</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaUsers /></div>
              <div className={styles.statInfo}>
                <h3>{stats.community}</h3>
                <p>Users</p>
              </div>
            </div>
          </div>

          {/* Categories Section - RESTORED */}
          <section className={styles.categorySection}>
            <div className={styles.sectionHeader}>
              <h2>Browse Categories</h2>
              <Link to="/browse" style={{color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', fontWeight: '600'}}>See All</Link>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/browse?category=${cat.id}`} className={styles.categoryCard}>
                  <div className={styles.catIcon}><cat.icon /></div>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* E-commerce Style Feed */}
          <section className={styles.feedSection}>
            <div className={styles.sectionHeader}>
              <h2>Recent Listings</h2>
              <div style={{display: 'flex', gap: '8px'}}>
                {['all', 'lost', 'found'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: filter === f ? 'var(--primary)' : '#fff',
                      color: filter === f ? '#fff' : 'var(--text-muted)',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.ecomGrid}>
              {loading ? (
                Array(6).fill(0).map((_, i) => <div key={i} style={{height: '350px', background: '#fff', borderRadius: '20px'}} className={styles.shimmer} />)
              ) : posts.length === 0 ? (
                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>
                  <p>No items found matching your criteria.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className={styles.productCard}>
                    <div className={styles.productImageWrap}>
                      <img src={post.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} alt={post.title} className={styles.productImage} />
                      <div className={styles.tagOverlay}>
                        <span className={`${styles.statusBadge} ${styles[post.status]}`}>{post.status}</span>
                      </div>
                      <button className={styles.favAction} onClick={(e) => { e.stopPropagation(); navigate('/favorites') }}>
                        <FaHeart />
                      </button>
                    </div>
                    
                    <div className={styles.productInfo}>
                      <div className={styles.productMeta}>
                        <span className={styles.productCat}>{post.category || 'General'}</span>
                        {post.reward_amount > 0 && (
                          <span className={styles.rewardBadge}>৳{post.reward_amount} Reward</span>
                        )}
                      </div>
                      <h3 className={styles.productTitle}>{post.title}</h3>
                      <div className={styles.productLoc}>
                        <FaMapMarkerAlt /> {post.location || 'Location N/A'}
                      </div>
                      
                      <div className={styles.productFooter}>
                        <div className={styles.ownerMini}>
                           <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.owner_name)}&background=random&size=32`} 
                              alt="Owner" 
                              className={styles.ownerAvatar}
                           />
                           <span className={styles.ownerName}>{post.owner_name}</span>
                        </div>
                        <button 
                          className={styles.buyBtn}
                          onClick={() => navigate(`/post/${post.id}`)}
                        >
                          {post.status === 'found' ? 'Claim Now' : 'I Found It'}
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
