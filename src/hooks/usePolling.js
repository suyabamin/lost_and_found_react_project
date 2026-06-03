import { useEffect, useState } from 'react'
import messagingService from '../services/messagingService'

export const usePollingMessages = (conversationId, interval = 3000) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!conversationId) return

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const response = await messagingService.getConversationMessages(conversationId)
        setMessages(response.data.messages || response.data || [])
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchMessages()

    // Then set up polling
    const timer = setInterval(fetchMessages, interval)

    return () => clearInterval(timer)
  }, [conversationId, interval])

  return { messages, loading, error }
}

export const usePollingItems = (filters = {}, interval = 5000) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/items?${new URLSearchParams(filters)}`)
        const data = await response.json()
        setItems(data.items || data || [])
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
    const timer = setInterval(fetchItems, interval)

    return () => clearInterval(timer)
  }, [JSON.stringify(filters)])

  return { items, loading, error }
}
