import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaComment, FaSpinner } from 'react-icons/fa'
import messagingService from '../services/messagingService'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'

const MessageOwnerButton = ({ itemId, ownerId, className }) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleStartChat = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You need to be logged in to send a message.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login Now',
        background: 'var(--card-bg, #fff)',
        color: 'var(--text-main, #000)'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login')
        }
      })
      return
    }

    if (user.id === ownerId) {
      Swal.fire('Info', 'This is your own post!', 'info')
      return
    }

    setLoading(true)
    try {
      const res = await messagingService.createConversation(itemId)
      const convId = res.data.id
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      })
      
      Toast.fire({
        icon: 'success',
        title: res.data.existing ? 'Opening conversation...' : 'Conversation started!'
      })

      setTimeout(() => {
        navigate(`/chat/${convId}`)
      }, 500)
    } catch (err) {
      console.error('Chat error:', err)
      // 403 = no approved claim yet
      if (err.response?.status === 403) {
        Swal.fire({
          icon: 'info',
          title: 'Claim Not Approved Yet',
          text: 'You can only start a chat after the founder approves your claim request.',
          confirmButtonColor: '#14b8a6',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Messaging Error',
          text: err.response?.data?.message || 'Could not initiate chat. Please try again later.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      className={className || 'primary-btn'} 
      onClick={handleStartChat} 
      disabled={loading}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
    >
      {loading ? <FaSpinner className="spin" /> : <FaComment />} 
      <span>{loading ? 'Wait...' : 'Send Message'}</span>
    </button>
  )
}

export default MessageOwnerButton;
