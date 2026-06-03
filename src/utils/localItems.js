const STORAGE_KEY = 'lf_items'

export const defaultItems = [
  { id: 1, title: 'Lost iPhone 13 Pro', status: 'lost', category: 'Electronics', image: 'https://via.placeholder.com/280x200?text=iPhone', location: 'Downtown', time: '2 hours ago', description: 'Space black iPhone with pink case.' },
  { id: 2, title: 'Found Blue Umbrella', status: 'found', category: 'Other', image: 'https://via.placeholder.com/280x200?text=Umbrella', location: 'Central Park', time: '5 hours ago', description: 'Blue umbrella found near the north gate.' },
  { id: 3, title: 'Missing Wallet', status: 'lost', category: 'Documents', image: 'https://via.placeholder.com/280x200?text=Wallet', location: 'Airport', time: '1 day ago', description: 'Brown wallet with ID cards.' },
  { id: 4, title: 'Found Car Keys', status: 'found', category: 'Keys', image: 'https://via.placeholder.com/280x200?text=Keys', location: 'Mall', time: '3 days ago', description: 'Car keys with a red keychain.' },
  { id: 5, title: 'Lost Laptop Bag', status: 'lost', category: 'Bag & Luggage', image: 'https://via.placeholder.com/280x200?text=Bag', location: 'Coffee Shop', time: '2 days ago', description: 'Black laptop bag with documents inside.' },
  { id: 6, title: 'Found Pet Dog', status: 'found', category: 'Pets', image: 'https://via.placeholder.com/280x200?text=Dog', location: 'Neighborhood', time: '4 days ago', description: 'Friendly dog found near the playground.' },
  { id: 7, title: 'Missing Wedding Ring', status: 'lost', category: 'Jewelry', image: 'https://via.placeholder.com/280x200?text=Ring', location: 'Restaurant', time: '5 days ago', description: 'Gold ring lost during dinner.' },
  { id: 8, title: 'Found Laptop Charger', status: 'found', category: 'Electronics', image: 'https://via.placeholder.com/280x200?text=Charger', location: 'Library', time: '1 week ago', description: 'USB-C charger found on reading desk.' }
]

const readStoredItems = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const getLocalItems = () => {
  const stored = readStoredItems()
  return [...stored, ...defaultItems]
}

export const saveLocalItem = (item) => {
  const stored = readStoredItems()
  const newItem = {
    id: Date.now(),
    time: 'Just now',
    ...item
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...stored]))
  return newItem
}
