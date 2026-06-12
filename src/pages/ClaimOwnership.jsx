import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from '../styles/pages/ClaimOwnership.module.css'
import { 
  FaHandshake, FaFileSignature, FaUser, FaEnvelope, 
  FaPhone, FaCheckCircle, FaInfoCircle, FaPaperPlane, 
  FaTimes, FaUpload, FaSpinner, FaIdCard, FaLightbulb, 
  FaBriefcase, FaMapMarkerAlt, FaClock
} from 'react-icons/fa'
import itemsService from '../services/itemsService'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'
import ClaimQuestionsForm from '../components/ClaimQuestionsForm'
import BackButton from '../components/BackButton'

const ClaimOwnership = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [proofImage, setProofImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  const [answers, setAnswers] = useState({})

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    reason: '',
    proofDescription: '',
    nid: '',
    confirmCheck: false
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchItemDetails()
  }, [id])

  const fetchItemDetails = async () => {
    setLoading(true)
    try {
      const res = await itemsService.getItemById(id)
      if (res.data?.item) {
        setItem(res.data.item)
      } else {
        Swal.fire('Error', 'Item not found.', 'error')
        navigate('/dashboard')
      }
    } catch (err) {
      console.error(err)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'File size must be less than 5MB', 'error')
        return
      }
      setProofImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.reason || !formData.proofDescription || !formData.confirmCheck) {
      Swal.fire('Required Fields', 'Please fill in all required fields and confirm ownership.', 'warning')
      return
    }

    // Check if all verification questions are answered
    if (item?.verification_questions?.length > 0) {
      const unanswered = item.verification_questions.filter(q => !answers[q.id] || !answers[q.id].trim());
      if (unanswered.length > 0) {
        Swal.fire('Verification Questions', 'Please answer all verification questions before submitting.', 'warning');
        return;
      }
    }

    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('item_id', id)
      submitData.append('reason', formData.reason)
      submitData.append('proof_description', formData.proofDescription)
      submitData.append('contact_info', formData.phone)
      submitData.append('nid', formData.nid)
      
      // Append verification answers
      Object.keys(answers).forEach(qId => {
        submitData.append(`answers[${qId}]`, answers[qId]);
      });

      if (proofImage) {
        submitData.append('proof_image', proofImage)
      }

      await itemsService.identifyOwnership(submitData)
      
      Swal.fire({
        title: 'Claim Submitted!',
        text: 'Your claim request has been received. Our team will review your submission and contact you within 24-48 hours.',
        icon: 'success',
        confirmButtonText: 'View My Claims',
        background: 'var(--card-bg, #fff)',
        color: 'var(--text-main, #000)'
      }).then(() => {
        navigate('/profile')
      })
    } catch (err) {
      console.error('Claim error:', err)
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || 'Something went wrong. Please try again.',
        background: 'var(--card-bg, #fff)',
        color: 'var(--text-main, #000)'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className={styles.claimPage}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <FaSpinner className="spin" size={40} color="var(--primary)" />
            <p>Loading item details...</p>
        </div>
        <Footer />
    </div>
  )

  return (
    <div className={styles.claimPage}>
      <Header />
      
      <main className={styles.content}>
        <div style={{ marginBottom: '24px' }}>
          <BackButton />
        </div>
        <header className={styles.topline}>
          <div className={styles.headerLeft}>
            <p className={styles.eyebrow}><FaHandshake /> Claim Process</p>
            <h1>Claim item request</h1>
            <p className={styles.subtitle}>Submit your claim with proof of ownership to get your lost item back</p>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.btnOutline} to="/police-gd">
              <FaBriefcase /> Police GD Form
            </Link>
          </div>
        </header>

        {item && (
          <div className={styles.itemSummary}>
            <div className={styles.itemImage}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className={styles.summaryThumb} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <FaBriefcase />
                </div>
              )}
            </div>
            <div className={styles.itemDetails}>
              <span className={`${styles.itemBadge} ${styles[item.status]}`}>
                {item.status.toUpperCase()}
              </span>
              <h2>{item.title}</h2>
              <div className={styles.itemMeta}>
                <span><FaMapMarkerAlt /> {item.location}</span>
                <span><FaClock /> Reported {new Date(item.created_at).toLocaleDateString()}</span>
                <span><FaUser /> Finder: {item.owner_name}</span>
              </div>
              <div className={styles.itemDescription}>
                <p>{item.description}</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3><FaFileSignature /> Claim Request Form</h3>
            <span className={styles.requiredBadge}>* Required fields</span>
          </div>
          
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className={styles.formField}>
              <label htmlFor="fullName">
                <FaUser /> Full Name <span className={styles.required}>*</span>
              </label>
              <input 
                type="text" id="fullName" name="fullName" 
                value={formData.fullName} onChange={handleInputChange}
                placeholder="Enter your full name" 
              />
            </div>
            
            <div className={styles.formField}>
              <label htmlFor="email">
                <FaEnvelope /> Email Address <span className={styles.required}>*</span>
              </label>
              <input 
                type="email" id="email" name="email" 
                value={formData.email} onChange={handleInputChange}
                placeholder="your@email.com" 
              />
            </div>
            
            <div className={styles.formField}>
              <label htmlFor="phone">
                <FaPhone /> Phone Number <span className={styles.required}>*</span>
              </label>
              <input 
                type="tel" id="phone" name="phone" 
                value={formData.phone} onChange={handleInputChange}
                placeholder="+880 1XXX-XXXXXX" 
              />
            </div>
            
            <div className={styles.formField}>
              <label htmlFor="nid">
                <FaIdCard /> NID / Passport Number
              </label>
              <input 
                type="text" id="nid" name="nid" 
                value={formData.nid} onChange={handleInputChange}
                placeholder="Optional for verification" 
              />
            </div>

            <div className={`${styles.formField} ${styles.full}`}>
              <label htmlFor="reason">
                <FaInfoCircle /> Why do you own this item? <span className={styles.required}>*</span>
              </label>
              <textarea 
                id="reason" name="reason" rows="3" 
                value={formData.reason} onChange={handleInputChange}
                placeholder="Briefly explain your connection to this item (e.g. I lost it at the park yesterday)"
              ></textarea>
            </div>
            
            <div className={`${styles.formField} ${styles.full}`}>
              <label htmlFor="proofDescription">
                <FaCheckCircle /> Ownership Proof Details <span className={styles.required}>*</span>
              </label>
              <textarea 
                id="proofDescription" name="proofDescription" rows="5" 
                value={formData.proofDescription} onChange={handleInputChange}
                placeholder="Describe specific details only the real owner would know (e.g., brand, contents, unique marks, serial numbers, etc.)"
              ></textarea>
              <div className={styles.hintText}>
                <FaLightbulb /> Tip: Include as many specific details as possible to help verify your claim
              </div>
            </div>

            {/* Verification Questions Section */}
            <div className={`${styles.formField} ${styles.full}`}>
               <ClaimQuestionsForm 
                 questions={item?.verification_questions} 
                 answers={answers} 
                 setAnswers={setAnswers} 
               />
            </div>

            <div className={`${styles.formField} ${styles.full}`}>
              <label>
                <FaUpload /> Evidence Image
              </label>
              <div className={styles.fileUploadArea} onClick={() => fileInputRef.current.click()}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className={styles.filePreview} />
                ) : (
                  <>
                    <FaUpload size={24} />
                    <p style={{ marginTop: '10px' }}>Click to upload proof of ownership (Receipt, photo of you with item, etc.)</p>
                  </>
                )}
                <input 
                  type="file" ref={fileInputRef} hidden 
                  onChange={handleFileChange} accept="image/*"
                />
              </div>
            </div>
            
            <div className={`${styles.formField} ${styles.full} ${styles.checkboxField}`}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" name="confirmCheck" 
                  checked={formData.confirmCheck} onChange={handleInputChange}
                />
                <span>I confirm that the information provided is accurate and I am the rightful owner of this item. <span className={styles.required}>*</span></span>
              </label>
            </div>
            
            <div className={`${styles.formField} ${styles.full} ${styles.cardActions}`}>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? <FaSpinner className="spin" /> : <FaPaperPlane />} 
                {submitting ? 'Submitting...' : 'Submit Claim Request'}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.processSteps}>
          <h4><FaInfoCircle /> How Claim Process Works</h4>
          <div className={styles.stepsGrid}>
            {[
              { n: '1', t: 'Submit Claim', d: 'Fill out the form with your details and proof' },
              { n: '2', t: 'Verification', d: 'Our team reviews your claim within 24-48 hours' },
              { n: '3', t: 'Contact', d: 'You will be contacted via phone or email' },
              { n: '4', t: 'Return', d: 'Arrange pickup with the finder or claim it' }
            ].map(step => (
              <div key={step.n} className={styles.step}>
                <div className={styles.stepNumber}>{step.n}</div>
                <div className={styles.stepContent}>
                  <h5 style={{ fontWeight: '700' }}>{step.t}</h5>
                  <p>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ClaimOwnership;
