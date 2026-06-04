import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MessageOwnerButton from '../components/MessageOwnerButton'
import styles from '../styles/pages/PostDetails.module.css'
import { 
  FaChevronLeft, FaChevronRight, FaShare, FaHeart, 
  FaSpinner, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaTag, 
  FaHandshake, FaShieldAlt, FaInfoCircle, FaLocationArrow
} from 'react-icons/fa'
import itemsService from '../services/itemsService'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { FaExternalLinkAlt } from 'react-icons/fa'

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PostDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    fetchPostDetails()
  }, [id])

  const fetchPostDetails = async () => {
    setLoading(true)
    try {
      const res = await itemsService.getItemById(id)
      if (res.data?.item) {
        const item = res.data.item
        setPost(item)
        setIsFavorite(item.is_favorited || false)
        setFavCount(item.favorite_count || 0)
      } else {
        setPost(null)
      }
    } catch (err) {
      console.error('Error fetching post details:', err)
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      Swal.fire('Login Required', 'You must be logged in to favorite items.', 'info')
      return
    }
    try {
      await itemsService.toggleFavorite({ item_id: id })
      const newStatus = !isFavorite
      setIsFavorite(newStatus)
      setFavCount(prev => newStatus ? prev + 1 : Math.max(0, prev - 1))
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      })
      Toast.fire({
        icon: 'success',
        title: newStatus ? 'Added to favorites' : 'Removed from favorites'
      })
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `Check out this ${post.status} item: ${post.title}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        Swal.fire({
          icon: 'success',
          title: 'Shared!',
          text: 'Shared successfully',
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        Swal.fire({
          icon: 'success',
          title: 'Link Copied!',
          text: 'Link copied successfully',
          timer: 1500,
          showConfirmButton: false
        })
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err)
        // Fallback to clipboard if share was cancelled or failed
        await navigator.clipboard.writeText(window.location.href)
        Swal.fire({
          icon: 'success',
          title: 'Link Copied!',
          text: 'Link copied to clipboard.',
          timer: 1500,
          showConfirmButton: false
        })
      }
    }
  }

  const handleClaim = () => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to claim ownership.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login Now'
      }).then((result) => {
        if (result.isConfirmed) navigate('/login')
      })
      return
    }
    if (user.id === post.user_id) {
      Swal.fire('Info', 'You cannot claim your own item.', 'info')
      return
    }
    navigate(`/claim/${id}`)
  }

  const postImages = post?.image_url ? [post.image_url] : []
  
  const nextImage = () => {
    if (postImages.length <= 1) return
    setCurrentImageIndex((prev) => (prev + 1) % postImages.length)
  }

  const prevImage = () => {
    if (postImages.length <= 1) return
    setCurrentImageIndex((prev) => (prev - 1 + postImages.length) % postImages.length)
  }

  if (loading) return (
    <div className={styles.postDetailsPage}>
      <Header />
      <div className={styles.loadingState}>
        <FaSpinner className={styles.spin} />
        <p>Fetching item details...</p>
      </div>
      <Footer />
    </div>
  )

  if (!post) return (
    <div className={styles.postDetailsPage}>
      <Header />
      <div className={styles.errorState}>
        <h2>Oops! Item Not Found</h2>
        <p>The post you are looking for might have been removed or doesn't exist.</p>
        <Link to="/dashboard" className={styles.primaryBtn}>Return Home</Link>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className={styles.postDetailsPage}>
      <Header />

      <div className={styles.topNav}>
        <div className={styles.breadcrumb}>
          <Link to="/dashboard">Home</Link> / <Link to="/browse">Browse</Link> / {post.title || 'Details'}
        </div>
        <div className={styles.navLinks}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>← Back</button>
          <Link to="/profile">My Profile</Link>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.listingHero}>
            <div className={styles.heroInfo}>
              <span className={`${styles.statusBadge} ${styles[post.status] || ''}`}>
                {post.status === 'lost' ? '⚠️ Lost Item' : '✅ Found Item'}
              </span>
              <h1>{post.title}</h1>
              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <FaMapMarkerAlt /> <span>{post.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <FaCalendarAlt /> <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className={styles.metaItem}>
                  <FaTag /> <span>{post.category}</span>
                </div>
              </div>
            </div>
            <div className={styles.heroActions}>
              <button className={styles.actionBtn} onClick={handleToggleFavorite}>
                <FaHeart style={{ color: isFavorite ? '#DC2626' : 'inherit' }} /> 
                {isFavorite ? 'Favorited' : 'Favorite'} ({favCount})
              </button>
              <button className={styles.actionBtn} onClick={handleShare}>
                <FaShare /> Share
              </button>
            </div>
          </div>

          <div className={styles.carousel}>
            <div className={styles.carouselMain}>
              {postImages.length > 0 ? (
                <img 
                  src={postImages[currentImageIndex]} 
                  alt={post.title}
                  className={styles.carouselImage}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+Unavailable' }}
                />
              ) : (
                <div className={styles.noImage}>
                    <FaEye size={48} style={{opacity: 0.2}} />
                    <p>No image provided</p>
                </div>
              )}
              {postImages.length > 1 && (
                <div className={styles.carouselControls}>
                  <button className={styles.carouselBtn} onClick={prevImage}><FaChevronLeft /></button>
                  <button className={styles.carouselBtn} onClick={nextImage}><FaChevronRight /></button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3><FaInfoCircle /> Details & Description</h3>
            <p className={styles.description}>{post.description || 'No description provided.'}</p>
            <div className={styles.metaChips}>
              <div className={styles.chip}><strong>ID:</strong> #{post.id}</div>
              <div className={styles.chip}><strong>Status:</strong> {post.status}</div>
              <div className={styles.chip}><strong>Category:</strong> {post.category}</div>
            </div>
          </div>

          {(post.latitude && post.longitude) && (
            <div className={styles.infoCard} style={{ marginTop: '24px' }}>
              <h3><FaMapMarkerAlt /> Exact Location</h3>
              <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', margin: '16px 0', border: '1px solid #e2e8f0' }}>
                <MapContainer 
                  center={[parseFloat(post.latitude), parseFloat(post.longitude)]} 
                  zoom={15} 
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker 
                    position={[parseFloat(post.latitude), parseFloat(post.longitude)]} 
                    icon={post.status === 'lost' ? redIcon : greenIcon}
                  />
                </MapContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{post.location}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Coordinates: {post.latitude}, {post.longitude}</p>
                </div>
                <button 
                  className={styles.actionBtn}
                  onClick={() => window.open(`https://www.google.com/maps?q=${post.latitude},${post.longitude}`, '_blank')}
                >
                  <FaExternalLinkAlt /> Open in Google Maps
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={`${styles.stickyAction} ${styles.actionCard}`}>
            <h3>📞 Connect with Owner</h3>
            <div className={styles.actionButtons}>
              <MessageOwnerButton 
                itemId={post.id} 
                ownerId={post.user_id} 
                className={styles.primaryBtn} 
              />
              {post.active_tracking_id ? (
                <button 
                  className={styles.trackingBtn} 
                  style={{ 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    marginTop: '10px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/tracking/${post.active_tracking_id}`)}
                >
                  <FaLocationArrow /> Live Location Tracking
                </button>
              ) : (
                <button className={styles.secondaryBtn} onClick={handleClaim}>
                  <FaHandshake /> Claim Ownership
                </button>
              )}
            </div>
          </div>

          <div className={styles.ownerCard}>
            <h3>👤 Posted By</h3>
            <div className={styles.ownerInfo}>
              <img 
                src={post.owner_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.owner_name || 'U')}&background=14B8A6&color=fff`} 
                alt="Owner"
                className={styles.ownerAvatar}
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.owner_name || 'U')}&background=14B8A6&color=fff` }}
              />
              <div className={styles.ownerMeta}>
                <h4>{post.owner_name || 'Anonymous User'}</h4>
                <p>Member since {post.owner_join_date ? new Date(post.owner_join_date).getFullYear() : '2026'}</p>
              </div>
            </div>
            <div className={styles.ownerStatsMini}>
               <span>Posts: {post.owner_posts_count || 0}</span>
               <span>Claims: {post.owner_claims_count || 0}</span>
            </div>
            <button className={styles.viewProfileBtn} onClick={() => navigate(`/profile/${post.user_id}`)}>
              View Profile
            </button>
          </div>
          
          <div className={styles.safetyCard}>
            <h4><FaShieldAlt /> Safety First</h4>
            <p>Always meet in public places, bring a friend, and never share sensitive personal information.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default PostDetailsPage
