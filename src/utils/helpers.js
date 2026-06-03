export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(2)
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 8
}

export const truncateText = (text, maxLength = 100) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export const getItemStatusColor = (status) => {
  switch (status) {
    case 'found':
      return '#00b894'
    case 'lost':
      return '#e74c3c'
    default:
      return '#95a5a6'
  }
}

export const getCategoryIcon = (category) => {
  const icons = {
    electronics: '📱',
    wallet: '👛',
    keys: '🔑',
    documents: '📄',
    jewelry: '💍',
    pets: '🐾',
    bags: '🎒',
    clothes: '👕',
    other: '📦'
  }
  return icons[category.toLowerCase()] || '📦'
}
