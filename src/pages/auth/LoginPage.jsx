import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import styles from '../../styles/pages/AuthPages.module.css'
import { FaHeart, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'

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
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <FaHeart /> Lost & Found
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your journey of reuniting lost items with their owners</p>
            <ul className={styles.features}>
              <li>✓ Track lost items in real-time</li>
              <li>✓ Connect with finders instantly</li>
              <li>✓ Secure and verified platform</li>
            </ul>
            <div className={styles.demoNote}>
              <strong>Demo Credentials:</strong>
              <p>Email: demo@example.com</p>
              <p>Password: password</p>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope className={styles.icon} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <FaLock className={styles.icon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className={styles.options}>
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#forgot">Forgot Password?</a>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p>Don't have an account? <Link to="/register">Sign up now</Link></p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default LoginPage
