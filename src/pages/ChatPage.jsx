import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import messagingService from '../services/messagingService'
import styles from '../styles/pages/ChatPage.module.css'
import { 
  FaArrowLeft, FaPhone, FaVideo, FaPaperclip, 
  FaSmile, FaPaperPlane, FaSearch, FaEllipsisV, 
  FaCheckCircle, FaImage, FaSpinner, FaComments,
  FaBoxOpen, FaMapMarkerAlt, FaCalendarAlt
} from 'react-icons/fa'

import BackButton from '../components/BackButton'

const ChatPage = () => {
    const { id: conversationId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    
    const [messages, setMessages] = useState([])
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [newMessage, setNewMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchData()
        const pollConversations = setInterval(fetchConversations, 30000)
        return () => clearInterval(pollConversations)
    }, [])

    useEffect(() => {
        if (conversationId) {
            fetchMessages()
            const pollMessages = setInterval(fetchMessages, 5000)
            return () => clearInterval(pollMessages)
        }
    }, [conversationId])

    const fetchData = async () => {
        setLoading(true)
        await fetchConversations()
        setLoading(false)
    }

    const fetchConversations = async () => {
        try {
            console.log('[CHAT] Fetching conversations...')
            const res = await messagingService.getConversations()
            const convs = res.data.conversations || []
            console.log('[CHAT] Conversations loaded:', convs.length)
            setConversations(convs)
            
            if (conversationId) {
                const current = convs.find(c => c.id == conversationId)
                if (current) setSelectedConversation(current)
            }
        } catch (err) {
            console.error('[CHAT] Fetch conversations error:', err)
        }
    }

    const fetchMessages = async () => {
        try {
            console.log('[CHAT] Fetching messages for:', conversationId)
            const res = await messagingService.getConversationMessages(conversationId)
            console.log('[CHAT] Messages loaded:', res.data.messages?.length || 0)
            setMessages(res.data.messages || [])
        } catch (err) {
            console.error('[CHAT] Fetch messages error:', err)
        }
    }

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault()
        const messageText = newMessage.trim()
        
        if ((!messageText && !selectedFile) || sending) {
            return
        }

        const formData = new FormData()
        if (messageText) formData.append('body', messageText)
        if (selectedFile) formData.append('attachment', selectedFile)

        // Optimistic update (simplified for attachments)
        const tempId = Date.now()
        const optimisticMsg = {
            id: tempId,
            conversation_id: conversationId,
            sender_id: user.id,
            body: messageText || 'Sending attachment...',
            attachment_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
            created_at: new Date().toISOString(),
            mine: true
        }
        
        setMessages(prev => [...prev, optimisticMsg])
        setNewMessage('')
        setSelectedFile(null)
        setSending(true)

        try {
            const res = await messagingService.sendMessage(conversationId, formData)
            console.log('[API] Message sent response:', res.data)
            
            if (res.data?.message) {
                setMessages(prev => prev.map(m => m.id === tempId ? res.data.message : m))
            }
            fetchConversations()
        } catch (err) {
            console.error('[API] Send message error:', err)
            setMessages(prev => prev.filter(m => m.id !== tempId))
            setNewMessage(messageText)
            alert(err.response?.data?.message || 'Failed to send message.')
        } finally {
            setSending(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large (max 5MB)')
                return
            }
            setSelectedFile(file)
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const filteredConversations = conversations.filter(conv =>
        conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.item_title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className={styles.chatPage}>
            <Header />
            <div className={styles.backButtonContainer}>
                <BackButton />
            </div>
            <main className={styles.mainContent}>
                {/* Left Panel: Conversation List */}
                <div className={styles.leftPanel}>
                    <div className={styles.panelHeader}>
                        <h2>Messages</h2>
                    </div>

                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.contactList}>
                        {loading && conversations.length === 0 ? (
                            <div className={styles.loadingCenter}><FaSpinner className="spin" /></div>
                        ) : filteredConversations.length === 0 ? (
                            <div className={styles.emptyCenter}>No conversations.</div>
                        ) : (
                            filteredConversations.map(conv => (
                                <button
                                    key={conv.id}
                                    className={`${styles.contactItem} ${conversationId == conv.id ? styles.active : ''}`}
                                    onClick={() => navigate(`/chat/${conv.id}`)}
                                >
                                    <div className={styles.contactAvatar}>
                                        <img 
                                            src={conv.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.other_user_name)}&background=00cfe8&color=fff&bold=true`} 
                                            alt={conv.other_user_name} 
                                        />
                                        {conv.online && <div className={styles.onlineIndicator}></div>}
                                    </div>
                                    <div className={styles.contactInfo}>
                                        <h4>{conv.other_user_name}</h4>
                                        <p className={styles.itemRef}>{conv.item_title}</p>
                                        <p className={styles.lastMsgPreview}>{conv.last_message || 'Start typing...'}</p>
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span className={styles.unreadBadge}>{conv.unread_count}</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Center Panel: Active Chat */}
                <div className={styles.centerPanel}>
                    {conversationId ? (
                        <>
                            <div className={styles.chatHeader}>
                                <div className={styles.contactHeader}>
                                    <img
                                        src={selectedConversation?.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation?.other_user_name || 'U')}&background=00cfe8&color=fff`}
                                        alt={selectedConversation?.other_user_name}
                                        className={styles.headerAvatar}
                                    />
                                    <div className={styles.contactHeaderInfo}>
                                        <h2>{selectedConversation?.other_user_name}</h2>
                                        <p className={styles.onlineStatus}>🟢 Online | Case: {selectedConversation?.item_title}</p>
                                    </div>
                                </div>
                                <div className={styles.chatActions}>
                                    <button className={styles.actionBtn}><FaPhone /></button>
                                    <button className={styles.actionBtn}><FaVideo /></button>
                                    <button className={styles.actionBtn}><FaEllipsisV /></button>
                                </div>
                            </div>

                            <div className={styles.messagesContainer}>
                                <div className={styles.messagesList}>
                                    {messages.length === 0 ? (
                                        <div className={styles.noMessages}>
                                            <p>No messages yet. Say hi to start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map(msg => {
                                            const isMine = msg.sender_id == user.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`${styles.messageWrapper} ${isMine ? styles.sentMessage : styles.receivedMessage}`}
                                                >
                                                    {!isMine && (
                                                        <img 
                                                            src={selectedConversation?.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation?.other_user_name || 'U')}&background=00A9B5&color=fff`} 
                                                            alt="" 
                                                            className={styles.msgAvatar}
                                                        />
                                                    )}
                                                    <div className={styles.messageBubble}>
                                                        {msg.body && <p>{msg.body}</p>}
                                                        {msg.attachment_url && (
                                                            <div className={styles.messageAttachment}>
                                                                {msg.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)/i) || msg.attachment_url.includes('cloudinary') ? (
                                                                    <img src={msg.attachment_url} alt="Attachment" onClick={() => window.open(msg.attachment_url)} />
                                                                ) : (
                                                                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                                                        <FaPaperclip /> View Attachment
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className={styles.messageTime}>
                                                            {isMine && <span style={{ marginRight: '4px' }}>You • </span>}
                                                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                            {isMine && <FaCheckCircle style={{ marginLeft: '6px', fontSize: '10px' }} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <form className={styles.inputArea} onSubmit={handleSendMessage}>
                                {selectedFile && (
                                    <div className={styles.filePreview}>
                                        <span>📎 {selectedFile.name}</span>
                                        <button type="button" onClick={() => setSelectedFile(null)}>✕</button>
                                    </div>
                                )}
                                <div className={styles.inputContainer}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        style={{ display: 'none' }} 
                                        onChange={handleFileSelect}
                                        accept="image/*,.pdf,.doc,.docx"
                                    />
                                    <button 
                                        type="button" 
                                        className={styles.attachBtn} 
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <FaPaperclip />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Type your message here..."
                                        className={styles.messageInput}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={sending}
                                    />
                                    <button type="button" className={styles.emojiBtn}><FaSmile /></button>
                                    <button
                                        type="submit"
                                        className={styles.sendBtn}
                                        disabled={(!newMessage.trim() && !selectedFile) || sending}
                                    >
                                        {sending ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className={styles.noChatSelected}>
                            <div className={styles.noChatContent}>
                                <FaComments size={80} color="var(--primary)" />
                                <h3>Select a conversation</h3>
                                <p>Choose a chat from the left to view messages and details.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Item Details Context */}
                {selectedConversation && (
                    <div className={styles.rightPanel}>
                        <div className={styles.panelTitle}>
                            <h3>Case Context</h3>
                        </div>
                        <div className={styles.detailsImage}>
                            <img src={selectedConversation.item_image || 'https://via.placeholder.com/300?text=No+Image'} alt={selectedConversation.item_title} />
                        </div>
                        <div className={styles.detailsContent}>
                            <span className={`${styles.badge} ${styles[selectedConversation.item_status]}`}>
                                {selectedConversation.item_status}
                            </span>
                            <h3>{selectedConversation.item_title}</h3>
                            <div className={styles.detailRow}>
                                <span className={styles.label}><FaMapMarkerAlt /> Location</span>
                                <span className={styles.value}>{selectedConversation.item_location || 'Not specified'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.label}><FaCalendarAlt /> Reported</span>
                                <span className={styles.value}>{new Date(selectedConversation.item_created_at).toLocaleDateString()}</span>
                            </div>
                            
                            <div className={styles.panelActions} style={{ marginTop: '20px' }}>
                                <button className={styles.primaryBtn} onClick={() => navigate(`/post/${selectedConversation.item_id}`)}>
                                    <FaBoxOpen /> Item Details
                                </button>
                                <button className={styles.secondaryBtn} onClick={() => navigate(`/claim/${selectedConversation.item_id}`)}>
                                    <FaCheckCircle /> Verify Ownership
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default ChatPage;
