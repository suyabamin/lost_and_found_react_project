import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MessageOwnerButton from '../components/MessageOwnerButton'
import styles from '../styles/pages/PostDetails.module.css'
import { 
  FaChevronLeft, FaChevronRight, FaShare, FaHeart, 
  FaSpinner, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaTag, 
  FaHandshake, FaShieldAlt, FaInfoCircle, FaLocationArrow,
  FaExternalLinkAlt, FaUserCheck, FaClock, FaBox, FaArrowLeft
} from 'react-icons/fa'
import itemsService from '../services/itemsService'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'

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

import BackButton from '../components/BackButton'

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
    window.scrollTo(0, 0)
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
      } else {
        await navigator.clipboard.writeText(window.location.href)
        Swal.fire({
          icon: 'success',
          title: 'Link Copied!',
          text: 'The sharing link has been copied to your clipboard.',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        })
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share error:', err)
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
    // Logic Patch: Defensive type-safe comparison
    // We only block navigation to the claim form if we are 100% certain 
    // that the current authenticated user created this post.
    const currentUserId = user?.id?.toString();
    const postOwnerId = post?.user_id?.toString();

    if (currentUserId && postOwnerId && currentUserId === postOwnerId) {
      Swal.fire('Info', 'You cannot claim your own item.', 'info')
      return;
    }
    navigate(`/claim/${id}`)
  }

  const postImages = post?.image_url ? [post.image_url] : []
  
  if (loading) return (
    <div className={styles.postDetailsPage}>
      <Header />
      <div className={styles.loadingState}>
        <FaSpinner className={`${styles.spin} spin`} />
        <p>Analyzing marketplace listing...</p>
      </div>
      <Footer />
    </div>
  )

  if (!post) return (
    <div className={styles.postDetailsPage}>
      <Header />
      <div className={styles.errorState}>
        <h2>Listing Not Found</h2>
        <p>This item maybe has been recovered or the listing expired.</p>
        <Link to="/dashboard" className="btn-premium btn-primary">Return to Marketplace</Link>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className={styles.postDetailsPage}>
      <Header />

      <div className={styles.topNav}>
        <div className={styles.breadcrumb}>
          <Link to="/dashboard">Marketplace</Link> / <span>{post.category}</span> / <span>{post.title}</span>
        </div>
        <BackButton />
      </div>

      <div className={styles.contentWrapper}>
        {/* Left Column: Gallery & Core Details */}
        <div className={styles.leftColumn}>
          <div className={styles.gallerySection}>
            <div className={styles.mainImageArea}>
              <div className={styles.imageOverlay}>
                <span className={`${styles.statusBadge} ${styles[post.status]}`}>
                  {post.status} Item
                </span>
              </div>
              <img 
                src={postImages[currentImageIndex] || 'https://via.placeholder.com/800x600?text=No+Image+Provided'} 
                alt={post.title}
                className={styles.mainImage}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=No+Image' }}
              />
            </div>
            {postImages.length > 1 && (
              <div className={styles.thumbnailsArea}>
                {postImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img}
                    alt="Thumbnail"
                    className={`${styles.thumbnail} ${currentImageIndex === idx ? styles.thumbnailActive : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.detailsCard}>
             <span className={styles.categoryTag}>{post.category}</span>
             <div className={styles.titleArea}>
               <h1>{post.title}</h1>
             </div>

             <div className={styles.quickInfo}>
               <div className={styles.infoItem}>
                 <span className={styles.infoLabel}>Location</span>
                 <span className={styles.infoValue}><FaMapMarkerAlt /> {post.location}</span>
               </div>
               <div className={styles.infoItem}>
                 <span className={styles.infoLabel}>Listed Date</span>
                 <span className={styles.infoValue}><FaCalendarAlt /> {new Date(post.created_at).toLocaleDateString()}</span>
               </div>
               <div className={styles.infoItem}>
                 <span className={styles.infoLabel}>Condition</span>
                 <span className={styles.infoValue}>Reference: #{post.id}</span>
               </div>
             </div>

             <div className={styles.descriptionArea}>
               <h3><FaInfoCircle /> Item Description</h3>
               <p className={styles.descriptionText}>{post.description || 'No detailed description provided for this listing.'}</p>
             </div>
          </div>

          {/* Map Section */}
          {(post.latitude && post.longitude) && (
            <div className={styles.mapCard}>
              <div className={styles.mapHeader}>
                <h4><FaMapMarkerAlt /> Recovery Location</h4>
                <button 
                  className={styles.utilityBtn}
                  onClick={() => window.open(`https://www.google.com/maps?q=${post.latitude},${post.longitude}`, '_blank')}
                >
                  <FaExternalLinkAlt /> Open Maps
                </button>
              </div>
              <div className={styles.mapArea}>
                <MapContainer 
                  center={[parseFloat(post.latitude), parseFloat(post.longitude)]} 
                  zoom={15} 
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker 
                    position={[parseFloat(post.latitude), parseFloat(post.longitude)]} 
                    icon={post.status === 'lost' ? redIcon : greenIcon}
                  />
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions & Poster */}
        <div className={styles.rightColumn}>
          {/* Main Action Component */}
          <div className={styles.actionsCard}>
             <div className={styles.posterActions}>
                {post.active_tracking_id ? (
                  <button 
                    className="btn-premium btn-primary"
                    style={{ width: '100%', height: '56px', background: '#10b981' }}
                    onClick={() => navigate(`/tracking/${post.active_tracking_id}`)}
                  >
                    <FaLocationArrow /> Track Return Live
                  </button>
                ) : (
                  <button className="btn-premium btn-primary" style={{ width: '100%', height: '56px' }} onClick={handleClaim}>
                    {post.status === 'found' ? 'Claim Possession' : 'Identify Ownership'}
                  </button>
                )}
             </div>
             
             <div className={styles.secondaryActions}>
                <button className={styles.utilityBtn} onClick={handleToggleFavorite}>
                   <FaHeart style={{ color: isFavorite ? '#EF4444' : 'inherit' }} />
                   {isFavorite ? 'Saved' : 'Save'}
                </button>
                <button className={styles.utilityBtn} onClick={handleShare}>
                   <FaShare /> Share
                </button>
             </div>
          </div>

          {/* Compact Poster Card */}
          <div className={styles.posterCard}>
            <div className={styles.posterHeader}>
              <img 
                src={post.owner_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.owner_name || 'U')}&background=00A9B5&color=fff&size=80`} 
                alt="Poster"
                className={styles.posterAvatar}
              />
              <div className={styles.posterMeta}>
                <h4>{post.owner_name}</h4>
                <p>Member since {post.owner_join_date ? new Date(post.owner_join_date).getFullYear() : '2024'}</p>
              </div>
            </div>
            
            <div className={styles.posterActions}>
              {String(user?.id) !== String(post?.user_id) && (
                <div className={styles.connectBtn}>
                   <MessageOwnerButton 
                      itemId={post.id} 
                      ownerId={post?.user_id} 
                      className="btn-premium btn-primary" 
                   />
                </div>
              )}
              <button 
                className={styles.viewProfile}
                onClick={() => navigate(`/profile/${post.user_id}`)}
              >
                View Seller Profile
              </button>
            </div>
          </div>

          {/* Trust & Safety */}
          <div className={`${styles.detailsCard} ${styles.safetyArea}`} style={{ padding: '24px', background: 'var(--bg-card-alt)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
              <FaShieldAlt /> Transaction Safety
            </h4>
            <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-body)' }}>
              Avoid upfront payments. Inspect items in person in public safe-zones before completing a return.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default PostDetailsPage
