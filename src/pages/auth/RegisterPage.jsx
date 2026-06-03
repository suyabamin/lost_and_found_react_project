import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import styles from '../../styles/pages/AuthPages.module.css'
import { FaHeart, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'

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

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!formData.name.trim()) {
      setError('Please enter your full name')
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
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      setError(errorMsg)
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <FaHeart /> Lost & Found
            </div>
            <h1>Join Our Community</h1>
            <p>Create an account and start reuniting lost items with their owners</p>
            <ul className={styles.features}>
              <li>✓ Post and find lost items</li>
              <li>✓ AI-powered matching system</li>
              <li>✓ Secure messaging</li>
            </ul>
          </div>

          <div className={styles.formSection}>
            <h2>Sign Up</h2>
            <p>Create your account in just a few steps</p>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrapper}>
                  <FaUser className={styles.icon} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope className={styles.icon} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+880 1234-567890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <FaLock className={styles.icon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password (min 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.togglePassword}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <FaLock className={styles.icon} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label className={styles.terms}>
                <input type="checkbox" required />
                I agree to the Terms of Service and Privacy Policy
              </label>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p>Already have an account? <Link to="/login">Sign in here</Link></p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default RegisterPage
