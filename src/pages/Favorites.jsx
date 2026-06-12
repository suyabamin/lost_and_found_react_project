import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from '../styles/pages/Favorites.module.css'
import { 
  FaHeart, FaSearch, FaFilter, FaPlus, FaMapPin, 
  FaArrowRight, FaHeartBroken, FaSpinner, FaCheckCircle,
  FaCircle
} from 'react-icons/fa'
import itemsService from '../services/itemsService'
import Swal from 'sweetalert2'

const Favorites = () => {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const navigate = useNavigate()

    useEffect(() => {
        fetchFavorites()
    }, [])

    const fetchFavorites = async () => {
        setLoading(true)
        try {
            const res = await itemsService.getFavorites()
            setFavorites(res.data.favorites || [])
        } catch (err) {
            console.error('Error fetching favorites:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveFavorite = async (e, itemId) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await itemsService.toggleFavorite({ item_id: itemId })
            setFavorites(prev => prev.filter(item => item.id !== itemId))
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            })
            Toast.fire({
                icon: 'success',
                title: 'Removed from favorites'
            })
        } catch (err) {
            console.error('Error removing favorite:', err)
        }
    }

    const filteredFavorites = favorites.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase()
        return matchesSearch && matchesCategory
    })

    const resolvedCount = favorites.filter(item => item.status === 'resolved').length

    return (
        <div className={styles.favPage}>
            <Header />
            
            <main className={styles.mainContent}>
                <header className={styles.favHeaderPremium}>
                    <div className={styles.headerTop}>
                        <div className={styles.titleMeta}>
                            <div className={styles.statusPill}>
                                <div className={styles.pulseDot}></div>
                                <span><FaCircle style={{ fontSize: '8px', marginRight: '4px' }} /> Live Collection</span>
                            </div>
                            <h1>Saved Favorites</h1>
                            <p>Manage and monitor your tracked lost and found cases.</p>
                        </div>
                        
                        <div className={styles.headerStats}>
                            <div className={styles.statBox}>
                                <span className={styles.statVal}>{favorites.length.toString().padStart(2, '0')}</span>
                                <span className={styles.statLabel}>Total Saved</span>
                                <FaHeart className={styles.statBgIcon} />
                            </div>
                            <div className={styles.statBox}>
                                <span className={`${styles.statVal} ${styles.textGreen}`}>{resolvedCount.toString().padStart(2, '0')}</span>
                                <span className={styles.statLabel}>Resolved</span>
                                <FaCheckCircle className={styles.statBgIcon} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.headerBottomBar}>
                        <div className={styles.searchIntegration}>
                            <FaSearch />
                            <input 
                                type="text" 
                                placeholder="Search by item name, location, or ID..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className={styles.filterActions}>
                            <div className={styles.customSelectGroup}>
                                <FaFilter />
                                <select 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="pets">Pets</option>
                                    <option value="documents">Documents</option>
                                    <option value="bags">Bags</option>
                                    <option value="keys">Keys</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>
                            <button className="primary-btn" onClick={() => navigate('/post/create')}>
                                <FaPlus /> New Listing
                            </button>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <FaSpinner className="spin" size={40} color="var(--primary)" />
                        <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading your collection...</p>
                    </div>
                ) : filteredFavorites.length > 0 ? (
                    <div className={styles.favGrid}>
                        {filteredFavorites.map(item => (
                            <div key={item.id} className={styles.modernCard}>
                                <div className={styles.cardMedia}>
                                    <img 
                                        src={item.image_url || 'https://via.placeholder.com/600x400?text=No+Image'} 
                                        alt={item.title} 
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+Unavailable' }}
                                    />
                                    <div className={`${styles.glassBadge} ${styles[item.status]}`}>
                                        {item.status}
                                    </div>
                                    <button 
                                        className={styles.heartBtn} 
                                        onClick={(e) => handleRemoveFavorite(e, item.id)}
                                        title="Remove from favorites"
                                    >
                                        <FaHeart />
                                    </button>
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.catTag}>{item.category}</div>
                                    <h3>{item.title}</h3>
                                    <div className={styles.locTag}><FaMapPin /> {item.location}</div>
                                     <div className={styles.cardBottom}>
                                         <button 
                                             className={styles.btnAction}
                                             onClick={() => navigate(`/post/${item.id}`)}
                                         >
                                             View Case
                                         </button>
                                         <button 
                                             className={styles.btnRemove}
                                             onClick={(e) => handleRemoveFavorite(e, item.id)}
                                         >
                                             Remove
                                         </button>
                                     </div>
                                     <span className={styles.timestamp}>
                                         {new Date(item.favorited_at || item.created_at).toLocaleDateString()}
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <FaHeartBroken />
                        <h3>{searchQuery ? 'No matching favorites' : 'No saved items yet'}</h3>
                        <p>{searchQuery ? 'Try adjusting your search or category filter.' : 'Start adding favorites from listings to track them here.'}</p>
                        <button 
                            className="btn-outline" 
                            onClick={() => searchQuery ? (setSearchQuery(''), setCategoryFilter('all')) : navigate('/browse')}
                            style={{ padding: '10px 24px', borderRadius: '40px', border: '1px solid var(--border-light)', cursor: 'pointer', fontWeight: '600' }}
                        >
                            {searchQuery ? 'Clear Filters' : 'Browse Listings'} <FaArrowRight />
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default Favorites;
