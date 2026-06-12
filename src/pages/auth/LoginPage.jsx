import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import styles from '../../styles/pages/AuthPages.module.css'
import { FaHeart, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaUsers, FaShieldAlt } from 'react-icons/fa'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await authService.login(email, password)
      const userData = response.data.user || response.data
      
      setSuccess('Login successful! Redirecting...')
      login(userData)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      setError(errorMsg)
      console.error('Login error:', err)
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
            <h1>Welcome back to the community.</h1>
            <p>Sign in to continue your journey of reuniting lost items with their rightful owners.</p>
            
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><FaCheckCircle /></div>
                <span>Track real-time item updates</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><FaUsers /></div>
                <span>Connect with 10k+ local finders</span>
              </li>
              <li className={styles.featureItem}>
                <div className={styles.featureIcon}><FaShieldAlt /></div>
                <span>Secure and verified platform</span>
              </li>
            </ul>

            <div className={styles.demoNote}>
              <strong>Demo Credentials:</strong>
              <p>Email: demo@example.com</p>
              <p>Password: password</p>
            </div>
          </div>

          {/* Form Panel */}
          <div className={styles.formPanel}>
            <h2>Sign In</h2>
            <p className={styles.subtitle}>Enter your details below to access your account</p>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope className={styles.inputIcon} />
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <FaLock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className={styles.optionsRow}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="#forgot" className={styles.forgotLink}>Forgot Password?</Link>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="spin" /> Signing in...
                  </>
                ) : (
                  'Sign In to Account'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p>Don't have an account? <Link to="/register">Create one now</Link></p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LoginPage
