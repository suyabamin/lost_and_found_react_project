import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from '../styles/pages/LandingPage.module.css'
import {
  FaSearch,
  FaMapMarkerAlt,
  FaComments,
  FaShieldAlt,
  FaPen,
  FaRobot,
  FaHandshake,
  FaArrowRight,
  FaPlay,
  FaQuoteLeft,
  FaCheckCircle,
  FaHeart
} from 'react-icons/fa'

const LandingPage = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Lost & Found | Reconnect What Matters'
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className={styles.landingPage}>
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb}></div>
          <div className={styles.orb}></div>
          <div className={styles.orb}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.badge}>
              <FaHeart /> Connecting Communities
            </div>
            <h1 className={styles.title}>
              Find What's Lost,<br />
              <span className={styles.gradient}>Return What Matters</span>
            </h1>
            <p className={styles.description}>
              Join thousands of users who are reuniting lost items with their owners.
              Post found items, search for lost belongings, and make someone's day.
            </p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>10K+</div>
                <div className={styles.statLabel}>Items Reunited</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>25K+</div>
                <div className={styles.statLabel}>Active Users</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>78%</div>
                <div className={styles.statLabel}>Match Rate</div>
              </div>
            </div>

            <div className={styles.heroButtons}>
              <Link to="/register" className={styles.btnPrimary}>
                Get Started <FaArrowRight />
              </Link>
              <button className={styles.btnSecondary}>
                How It Works <FaPlay />
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.floatingCard1}>
              <div>📱</div>
              <span>iPhone 14 Pro</span>
              <span className={styles.badgeFound}>Found</span>
            </div>
            <div className={styles.floatingCard2}>
              <div>👛</div>
              <span>Leather Wallet</span>
              <span className={styles.badgeLost}>Lost</span>
            </div>
            <div className={styles.floatingCard3}>
              <div>🔑</div>
              <span>Key Set</span>
              <span className={styles.badgeFound}>Found</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Why Choose Us</span>
            <h2>Smart & Simple Way to Reconnect</h2>
            <p>Our platform makes it easy to report lost items and help others find theirs</p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <FaSearch className={styles.featureIcon} />
              <h3>AI-Powered Matching</h3>
              <p>Our intelligent system automatically matches lost and found items based on descriptions and categories.</p>
            </div>
            <div className={styles.featureCard}>
              <FaMapMarkerAlt className={styles.featureIcon} />
              <h3>Location-Based Alerts</h3>
              <p>Get notified when items are reported in your area, increasing chances of recovery.</p>
            </div>
            <div className={styles.featureCard}>
              <FaComments className={styles.featureIcon} />
              <h3>Secure Chat System</h3>
              <p>Communicate safely with finders or owners through our encrypted messaging platform.</p>
            </div>
            <div className={styles.featureCard}>
              <FaShieldAlt className={styles.featureIcon} />
              <h3>Verified Claims</h3>
              <p>We verify ownership claims to ensure items go back to the right person.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Simple Process</span>
            <h2>How It Works</h2>
            <p>Three easy steps to reunite lost items with their owners</p>
          </div>

          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <FaPen className={styles.stepIcon} />
              <h3>Report Item</h3>
              <p>Post details about lost or found item with photos and location</p>
            </div>
            <div className={styles.stepArrow}><FaArrowRight /></div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <FaRobot className={styles.stepIcon} />
              <h3>AI Matching</h3>
              <p>Our system finds potential matches automatically</p>
            </div>
            <div className={styles.stepArrow}><FaArrowRight /></div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <FaHandshake className={styles.stepIcon} />
              <h3>Reunite</h3>
              <p>Connect and arrange for item return securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Success Stories</span>
            <h2>What Our Community Says</h2>
            <p>Real stories from people who found their lost items</p>
          </div>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <FaQuoteLeft className={styles.quoteIcon} />
              <p>I lost my wallet with all my important cards. Within 24 hours, someone had posted it and I got it back thanks to this platform!</p>
              <div className={styles.author}>
                <img src="https://ui-avatars.com/api/?name=Sarah+M&background=00cfe8&color=fff" alt="Sarah" />
                <div>
                  <h4>Sarah M.</h4>
                  <span>Dhaka, Bangladesh</span>
                </div>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <FaQuoteLeft className={styles.quoteIcon} />
              <p>Found someone's iPhone and was able to return it within hours. The feeling of helping someone is priceless!</p>
              <div className={styles.author}>
                <img src="https://ui-avatars.com/api/?name=Rakib+H&background=00b894&color=fff" alt="Rakib" />
                <div>
                  <h4>Rakib H.</h4>
                  <span>Chittagong, Bangladesh</span>
                </div>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <FaQuoteLeft className={styles.quoteIcon} />
              <p>The AI matching system is incredible! It suggested a match I would have never found on my own.</p>
              <div className={styles.author}>
                <img src="https://ui-avatars.com/api/?name=Nabila+K&background=ff5c5c&color=fff" alt="Nabila" />
                <div>
                  <h4>Nabila K.</h4>
                  <span>Sylhet, Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Ready to Get Started?</h2>
          <p>Join our community today and help make lost items find their way home</p>
          <div className={styles.ctaButtons}>
            <Link to="/register" className={styles.btnPrimary}>
              Sign Up Now <FaArrowRight />
            </Link>
            <Link to="/browse" className={styles.btnOutline}>
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
