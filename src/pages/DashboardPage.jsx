import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import NotificationBell from '../components/NotificationBell'
import styles from '../styles/pages/Dashboard.module.css'
import itemsService from '../services/itemsService'
import authService from '../services/authService'
import { FaEye, FaHandshake, FaUsers, FaSearch, FaBell, FaHome, FaCompass, FaPlus, FaUser, FaLaptopCode, FaPaw, FaBriefcase, FaKey, FaFileAlt, FaGem, FaList, FaComments, FaComment, FaHandPaper, FaMap, FaHeart, FaShieldAlt, FaChartLine, FaClock, FaArrowRight } from 'react-icons/fa'
import apiClient from '../services/api'

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({
    active: 0,
    matches: 0,
    community: 0
  })
  const [loading, setLoading] = useState(true)

  const categories = [
    { name: 'Electronics', icon: FaLaptopCode, count: '142 items', id: 'electronics' },
    { name: 'Pets', icon: FaPaw, count: '53 items', id: 'pets' },
    { name: 'Bag & Luggage', icon: FaBriefcase, count: '87 items', id: 'bag' },
    { name: 'Keys', icon: FaKey, count: '34 items', id: 'key' },
    { name: 'Documents', icon: FaFileAlt, count: '41 items', id: 'paper' },
    { name: 'Jewelry', icon: FaGem, count: '28 items', id: 'jewelry' }
  ]

  const quickLinks = [
    { name: 'Browse Listing', icon: FaList, desc: 'View all posts', href: '/browse' },
    { name: 'Create Post', icon: FaPlus, desc: 'Lost / found item', href: '/post/create' },
    { name: 'Conversations', icon: FaComments, desc: 'Message center', href: '/chat' },
    { name: 'Chat', icon: FaComment, desc: 'Direct chat', href: '/chat' },
    { name: 'Claim Item', icon: FaHandPaper, desc: 'Verification form', href: '/claim' },
    { name: 'Map View', icon: FaMap, desc: 'Location view', href: '/map' },
    { name: 'Notifications', icon: FaBell, desc: 'Alerts', href: '/notifications' },
    { name: 'Favorites', icon: FaHeart, desc: 'Saved items', href: '/favorites' },
    { name: 'Profile', icon: FaUser, desc: 'User profile', href: '/profile' },
    { name: 'Police GD', icon: FaShieldAlt, desc: 'Report support', href: '/police-gd' },
    { name: 'Admin Panel', icon: FaShieldAlt, desc: 'Moderation', href: '/admin' },
    { name: 'Analytics', icon: FaChartLine, desc: 'Admin stats', href: '/analytics' }
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [filter])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const filters = filter === 'all' ? {} : { status: filter }
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
  }

  return (
    <div className={styles.dashboardPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.topHeader}>
          <div className={styles.greeting}>
            <h1 className={styles.welcomeTitle}>Welcome back, <span>{user?.name || 'Guest'}</span></h1>
            <p className={styles.subhead}>Find what's lost, return what's found.</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search for lost or found items..." 
                aria-label="Search"
              />
            </div>
            <NotificationBell />
            <Link to="/profile" className={styles.userAvatar} title="Go to Profile">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?background=0D9488&color=fff&rounded=true&bold=true&size=40&name=${encodeURIComponent(user?.name || 'User')}`} 
                alt="Avatar" 
              />
            </Link>
          </div>
        </div>

        <div className={styles.contentArea}>
          {/* Stats Section */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaEye /></div>
              <div className={styles.statInfo}>
                <h3>{stats.active}</h3>
                <p>Active Listings</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaHandshake /></div>
              <div className={styles.statInfo}>
                <h3>{stats.matches}</h3>
                <p>Successful Matches</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FaUsers /></div>
              <div className={styles.statInfo}>
                <h3>{stats.community}</h3>
                <p>Community Members</p>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2><FaGem /> Browse by Category</h2>
              <Link to="/browse" className={styles.seeAllLink}>
                All categories <FaArrowRight />
              </Link>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => {
                const IconComponent = cat.icon
                return (
                  <Link key={cat.id} to={`/category/${cat.id}`} className={styles.categoryCard}>
                    <div className={styles.iconBox}><IconComponent /></div>
                    <p>{cat.name}</p>
                    <span className={styles.catCount}>{cat.count}</span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Quick Links Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2><FaHome /> Project Pages</h2>
              <Link to="/browse" className={styles.seeAllLink}>
                All pages <FaArrowRight />
              </Link>
            </div>
            <div className={styles.categoryGrid}>
              {quickLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <Link key={link.name} to={link.href} className={styles.categoryCard}>
                    <div className={styles.iconBox}><IconComponent /></div>
                    <p>{link.name}</p>
                    <span className={styles.catCount}>{link.desc}</span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Recent Activity Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2><FaClock /> Recent Activity</h2>
              <Link to="/browse" className={styles.seeAllLink}>
                View all <FaArrowRight />
              </Link>
            </div>

            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
              >
                ✨ All
              </button>
              <button 
                className={`${styles.filterBtn} ${filter === 'lost' ? styles.active : ''}`}
                onClick={() => setFilter('lost')}
              >
                ⚠️ Lost
              </button>
              <button 
                className={`${styles.filterBtn} ${filter === 'found' ? styles.active : ''}`}
                onClick={() => setFilter('found')}
              >
                ✅ Found
              </button>
            </div>

            <div className={styles.postsGrid}>
              {loading ? (
                Array(6).fill(0).map((_, i) => <div key={i} className={styles.skeletonCard} />)
              ) : (
                posts.map((post) => (
                  <div key={post.id} className={styles.postCard} onClick={() => navigate(`/post/${post.id}`)}>
                    <img src={post.image_url || 'https://via.placeholder.com/280x180?text=No+Image'} alt={post.title} className={styles.postImage} />
                    <div className={styles.postContent}>
                      <span className={`${styles.postStatus} ${styles[post.status]}`}>
                        {post.status === 'lost' ? '⚠️ Lost' : '✅ Found'}
                      </span>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <div className={styles.postMeta}>
                        <span>{post.location}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!loading && posts.length === 0 && (
              <div className={styles.emptyDashboard}>No items found matching your criteria.</div>
            )}

            <div className={styles.loadMoreContainer}>
              <button className={styles.loadMore} onClick={() => navigate('/browse')}>
                View all posts <FaArrowRight />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
