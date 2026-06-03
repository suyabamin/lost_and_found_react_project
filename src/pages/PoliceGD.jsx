import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/ClaimOwnership.module.css' // Reuse claim styles
import { FaShieldAlt, FaFileSignature, FaUser, FaIdCard, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaPaperPlane } from 'react-icons/fa'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

const PoliceGD = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      Swal.fire({
        icon: 'success',
        title: 'Report Submitted',
        text: 'Your Police GD report has been successfully submitted and forwarded to the relevant authorities. You will receive a confirmation GD number via SMS/Email shortly.',
        confirmButtonText: 'Back to Dashboard'
      }).then(() => navigate('/dashboard'))
    }, 2000)
  }

  return (
    <div className={styles.claimPage}>
      <Header />
      <main className={styles.content}>
        <header className={styles.topline}>
          <div className={styles.headerLeft}>
            <p className={styles.eyebrow}><FaShieldAlt /> Law Enforcement Support</p>
            <h1>Police GD Form</h1>
            <p className={styles.subtitle}>Report your lost items formally to law enforcement for better recovery chances and legal documentation.</p>
          </div>
        </header>

        <div className={styles.card}>
           <div className={styles.cardHeader}>
             <h3><FaFileSignature /> Formal GD Submission</h3>
           </div>
           
           <form className={styles.formGrid} onSubmit={handleSubmit}>
             <div className={styles.formField}>
               <label><FaUser /> Applicant Name</label>
               <input type="text" placeholder="Full name as per NID" required />
             </div>
             
             <div className={styles.formField}>
               <label><FaIdCard /> NID Number</label>
               <input type="text" placeholder="10 or 17 digit NID" required />
             </div>

             <div className={styles.formField}>
               <label><FaMapMarkerAlt /> Incident Location</label>
               <input type="text" placeholder="Specific area/thana" required />
             </div>

             <div className={styles.formField}>
               <label><FaCalendarAlt /> Incident Date & Time</label>
               <input type="datetime-local" required />
             </div>

             <div className={`${styles.formField} ${styles.full}`}>
               <label>Description of Lost Item</label>
               <textarea rows="4" placeholder="Detail all identifying marks, brand, serial numbers etc." required></textarea>
             </div>

             <div className={`${styles.formField} ${styles.full} ${styles.checkboxField}`}>
               <label className={styles.checkboxLabel}>
                 <input type="checkbox" required />
                 <span>I solemnly declare that the information provided is true to the best of my knowledge and I understand the legal implications of a false report.</span>
               </label>
             </div>

             <div className={`${styles.formField} ${styles.full} ${styles.cardActions}`}>
                <button type="submit" className={styles.btnPrimary} style={{ background: '#1e293b' }} disabled={submitting}>
                   {submitting ? 'Processing...' : 'Submit Formal Report'} <FaPaperPlane style={{ marginLeft: '8px' }} />
                </button>
             </div>
           </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PoliceGD
