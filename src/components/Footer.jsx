import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import { FaHeart, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Section */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <FaHeart />
              <span>Lost & Found</span>
            </div>
            <p>Connecting communities to reunite lost belongings with their owners.</p>
            <div className={styles.social}>
              <a href="#" target="_blank" rel="noreferrer"><FaFacebook /></a>
              <a href="#" target="_blank" rel="noreferrer"><FaTwitter /></a>
              <a href="#" target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href="#" target="_blank" rel="noreferrer"><FaLinkedin /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.links}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse Items</Link></li>
              <li><Link to="/post/create">Post Item</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className={styles.links}>
            <h4>Resources</h4>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#safety">Safety Tips</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contact}>
            <h4>Contact Us</h4>
            <div className={styles.contactItem}>
              <FaPhone /> <span>+880 1234-567890</span>
            </div>
            <div className={styles.contactItem}>
              <FaEnvelope /> <span>support@lostandfound.com</span>
            </div>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt /> <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; 2024 Lost & Found. All rights reserved. Made with ❤️ by the team.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
