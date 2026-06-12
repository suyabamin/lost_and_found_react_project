import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/CreatePost.module.css'
import { FaTrash, FaArrowRight, FaSpinner } from 'react-icons/fa'
import itemsService from '../services/itemsService'
import Swal from 'sweetalert2'
import LocationPicker from '../components/LocationPicker'
import VerificationQuestionsSection from '../components/VerificationQuestionsSection'

import BackButton from '../components/BackButton'

const CreatePostPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: 'lost',
    description: '',
    location: '',
    full_address: '',
    latitude: null,
    longitude: null,
    date: '',
  })
  const [verificationQuestions, setVerificationQuestions] = useState([])
  const [images, setImages] = useState([])
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddressFetch = (data) => {
    if (data) {
      // Craft a user-friendly location string from address details if available
      const addr = data.details;
      const city = addr.city || addr.town || addr.village || addr.suburb || '';
      const area = addr.road || addr.neighbourhood || '';
      const shortAddr = [area, city].filter(Boolean).join(', ');

      setFormData(prev => ({
        ...prev,
        location: shortAddr || data.full_address.split(',')[0],
        full_address: data.full_address
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        location: '',
        full_address: ''
      }))
    }
  }

  const categories = [
    'Electronics',
    'Pets',
    'Bag & Luggage',
    'Keys',
    'Documents',
    'Jewelry',
    'Clothing',
    'Vehicles',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageDrop = (e) => {
    e.preventDefault()
    setDragover(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    handleImageUpload(files)
  }

  const handleImageUpload = (files) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const postData = {
        ...formData,
        verification_questions: verificationQuestions,
        image_url: images.length > 0 ? images[0] : null // Use first image as main
      }
      
      await itemsService.createItem(postData)
      
      Swal.fire({
        icon: 'success',
        title: 'Post Created!',
        text: 'Your item has been posted successfully.',
        background: 'var(--bg-white)',
        color: 'var(--text-primary)',
        confirmButtonColor: '#14B8A6'
      })
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please check your connection.')
      console.error('Create post error:', err)
    } finally {
      setLoading(false)
    }
  }

  const descLength = formData.description.length

  return (
    <div className={styles.createPostPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          <BackButton />
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <h1>Post an Item</h1>
              <p>Report a lost or found item with photos and details</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {/* Left Column - Form */}
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Item Title *</label>
                <input
                  type="text"
                  name="title"
                  className={styles.input}
                  placeholder="e.g., Lost iPhone 13 Pro"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category *</label>
                <select
                  name="category"
                  className={styles.select}
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="lost"
                      checked={formData.status === 'lost'}
                      onChange={handleInputChange}
                    />
                    ⚠️ Lost Item
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="status"
                      value="found"
                      checked={formData.status === 'found'}
                      onChange={handleInputChange}
                    />
                    ✅ Found Item
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description *</label>
                <textarea
                  name="description"
                  className={styles.textarea}
                  placeholder="Describe the item in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength="1000"
                  required
                ></textarea>
                <div className={styles.characterCounter}>{descLength}/1000</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Location *</label>
                <input
                  type="text"
                  name="location"
                  className={styles.input}
                  placeholder="Where did you lose/find it?"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mark Exact Location on Map *</label>
                <LocationPicker 
                  onChange={(pos) => setFormData(prev => ({ 
                    ...prev, 
                    latitude: pos?.lat || null, 
                    longitude: pos?.lng || null 
                  }))} 
                  onAddressFetch={handleAddressFetch}
                />
                {!formData.latitude && (
                  <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                    * Please click on the map to mark the exact location.
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  className={styles.input}
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <VerificationQuestionsSection 
                  questions={verificationQuestions} 
                  setQuestions={setVerificationQuestions} 
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className={styles.spin} /> Posting...
                    </>
                  ) : (
                    <>
                      <FaArrowRight /> Post Item
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className={styles.discardBtn}
                  onClick={() => navigate('/dashboard')}
                >
                  Discard
                </button>
              </div>
            </div>

            {/* Right Column - Upload & Tips */}
            <div className={styles.uploadSection}>
              <h3>Add Photos</h3>
              
              <div 
                className={`${styles.dropZone} ${dragover ? styles.dragover : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleImageDrop}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <div className={styles.dropZoneIcon}>📸</div>
                <p className={styles.dropZoneText}>Click to upload or drag & drop</p>
                <p className={styles.dropZoneHint}>PNG, JPG up to 10MB</p>
              </div>

              <input 
                id="fileInput"
                type="file" 
                multiple 
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => handleImageUpload(Array.from(e.target.files))}
              />

              {images.length > 0 && (
                <div className={styles.previewGrid}>
                  {images.map((img, idx) => (
                    <div key={idx} className={styles.previewItem}>
                      <img src={img} alt={`Preview ${idx + 1}`} className={styles.previewImage} />
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => removeImage(idx)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.tipsBox}>
                <h4>📋 Tips for Better Results</h4>
                <ul>
                  <li>Use clear, well-lit photos</li>
                  <li>Show item from multiple angles</li>
                  <li>Include identifying marks or labels</li>
                  <li>Add reference objects for size</li>
                </ul>
              </div>

              <div className={styles.impactStats}>
                <h4>📊 Post Impact</h4>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Visibility</span>
                  <span className={styles.statValue}>{images.length > 0 ? '90%' : '45%'}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Response Rate</span>
                  <span className={styles.statValue}>{formData.location ? '8.5x' : '2.1x'}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Est. Views</span>
                  <span className={styles.statValue}>{images.length > 2 ? '1.2K' : '300'}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CreatePostPage
