import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from '../styles/pages/Conversations.module.css'
import { 
  FaComments, FaSearch, FaPlus, FaClock, FaBell, 
  FaCheckCircle, FaMapPin, FaArrowRight, FaSpinner, 
  FaCommentDots, FaBoxOpen, FaInfoCircle
} from 'react-icons/fa'
import messagingService from '../services/messagingService'
import { useAuth } from '../context/AuthContext'

const ConversationsPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')

    useEffect(() => {
        fetchConversations()
        // Poll for updates every 15 seconds
        const pollId = setInterval(fetchConversations, 15000)
        return () => clearInterval(pollId)
    }, [])

    const fetchConversations = async () => {
        try {
            const res = await messagingService.getConversations()
            setConversations(res.data.conversations || [])
        } catch (err) {
            console.error('Failed to fetch conversations:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = 
            conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.item_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
        
        let matchesFilter = true
        if (activeFilter === 'unread') matchesFilter = (conv.unread_count || 0) > 0
        else if (activeFilter === 'active') matchesFilter = conv.item_status !== 'resolved'
        else if (activeFilter === 'resolved') matchesFilter = conv.item_status === 'resolved'
        
        return matchesSearch && matchesFilter
    })

    const stats = {
        active: conversations.filter(c => c.item_status !== 'resolved').length,
        unread: conversations.filter(c => (c.unread_count || 0) > 0).length,
        resolved: conversations.filter(c => c.item_status === 'resolved').length
    }

    return (
        <div className={styles.conversationsPage}>
            <Header />
            
            <main className={styles.content}>
                <header className={styles.topline}>
                    <div className={styles.headerLeft}>
                        <p className={styles.eyebrow}><FaComments /> Messenger</p>
                        <h1>Conversations</h1>
                        <p className={styles.subtitle}>Connect with item owners and finders to resolve cases</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.btnPrimary} onClick={() => navigate('/browse')}>
                            <FaPlus /> New conversation
                        </button>
                    </div>
                </header>

                <div className={styles.statsSummary}>
                    <div className={styles.statBox}>
                        <FaClock />
                        <div>
                            <span className={styles.statNumber}>{stats.active.toString().padStart(2, '0')}</span>
                            <span className={styles.statLabel}>Active Chats</span>
                        </div>
                    </div>
                    <div className={styles.statBox}>
                        <FaBell />
                        <div>
                            <span className={styles.statNumber}>{stats.unread.toString().padStart(2, '0')}</span>
                            <span className={styles.statLabel}>Unread Messages</span>
                        </div>
                    </div>
                    <div className={styles.statBox}>
                        <FaCheckCircle />
                        <div>
                            <span className={styles.statNumber}>{stats.resolved.toString().padStart(2, '0')}</span>
                            <span className={styles.statLabel}>Cases Resolved</span>
                        </div>
                    </div>
                </div>

                <section className={styles.filtersSection}>
                    <div className={styles.searchContainer}>
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Find a conversation..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterTabs}>
                        {['all', 'unread', 'active', 'resolved'].map(f => (
                            <button 
                                key={f}
                                className={`${styles.filterTab} ${activeFilter === f ? styles.active : ''}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </section>

                <div className={styles.conversationsList}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <FaSpinner className="spin" size={30} color="var(--primary)" />
                            <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Fetching messages...</p>
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => (
                            <div 
                                key={conv.id} 
                                className={`${styles.conversationCard} ${conv.unread_count > 0 ? styles.unread : ''}`}
                                onClick={() => navigate(`/chat/${conv.id}`)}
                            >
                                <div className={styles.conversationAvatar}>
                                    <img 
                                        src={conv.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.other_user_name)}&background=00cfe8&color=fff&bold=true`} 
                                        alt={conv.other_user_name} 
                                    />
                                    {conv.online && <div className={styles.onlineIndicator}></div>}
                                </div>
                                <div className={styles.conversationInfo}>
                                    <div className={styles.conversationHeader}>
                                        <h3>
                                            {conv.other_user_name}
                                            <span className={`${styles.itemBadge} ${styles[conv.item_status]}`}>
                                                {conv.item_status}
                                            </span>
                                        </h3>
                                        <span className={styles.time}>
                                            {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className={styles.itemName}><FaBoxOpen /> Case: {conv.item_title}</div>
                                    <p className={styles.lastMessage}>{conv.last_message || 'Start the conversation...'}</p>
                                    <div className={styles.conversationMeta}>
                                        {conv.unread_count > 0 && (
                                            <span className={styles.messageCount}>{conv.unread_count} new</span>
                                        )}
                                        <span className={`${styles.status} ${styles[conv.item_status === 'resolved' ? 'resolved' : 'active']}`}>
                                            {conv.item_status === 'resolved' ? 'Resolved' : 'Active Channel'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.conversationActions}>
                                    <button className={styles.btnChat}>
                                        Open Chat <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <FaCommentDots />
                            <h3>{searchQuery ? 'No conversations match' : 'No messages yet'}</h3>
                            <p>{searchQuery ? 'Try another search term or clear the filter.' : 'Visit the browse page to contact owners or finders.'}</p>
                            <button className="primary-btn" onClick={() => navigate('/browse')}>
                                Browse Items <FaArrowRight />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default ConversationsPage;
