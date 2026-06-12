import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import styles from '../../styles/pages/AuthPages.module.css'
import { FaHeart, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaRobot, FaComments, FaPhone } from 'react-icons/fa'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 5) {
      setError('Password is too short')
      return
    }

    setLoading(true)

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      })
      const userData = response.data.user || response.data
      
      setSuccess('Registration successful! Logging you in...')
      login(userData)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <Header />
      
      <main className={styles.authContent}>
        <div className={styles.authContainer}>
          {/* Brand Panel */}
          <div className={styles.brandPanel}>
            <div className={styles.logo}>
              <FaHeart /> Lost & Found
            </div>
            <h1>Start reuniting today.</h1>
            <p>Create an account and join our global community dedicated to finding what was lost.</p>
            
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><FaCheckCircle /></div>
                <span>Post and find items easily</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><FaRobot /></div>
                <span>AI-powered smart matching</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><FaComments /></div>
                <span>Encrypted secure messaging</span>
              </li>
            </ul>
          </div>

          {/* Form Panel */}
          <div className={styles.formPanel}>
            <h2>Create Account</h2>
            <p className={styles.subtitle}>Fill in the details below to join us</p>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrapper}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    type="text"
                    name="name"
                    className={styles.input}
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    className={styles.input}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <FaPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    name="phone"
                    className={styles.input}
                    placeholder="+880 1XXX-XXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <FaLock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={styles.input}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.togglePass}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <FaLock className={styles.inputIcon} />
                  <input
                    type="password"
                    name="confirmPassword"
                    className={styles.input}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label className={styles.termsLabel}>
                <input type="checkbox" required />
                <span>I agree to the <b>Terms of Service</b> and <b>Privacy Policy</b></span>
              </label>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="spin" /> Creating Account...
                  </>
                ) : (
                  'Join the Community'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p>Already have an account? <Link to="/login">Sign in here</Link></p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default RegisterPage
