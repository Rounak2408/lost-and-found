// Mock implementation for finds and losses when Supabase is not configured
// This allows forms to work without requiring Supabase setup

export interface Find {
  id: number
  user_id: number
  item_name: string
  item_description: string
  location_found: string
  date_found: string
  image_url?: string
  contact_info?: string
  status: 'available' | 'claimed' | 'returned' | 'pending'
  created_at: string
  updated_at: string
}

export interface Loss {
  id: number
  user_id: number
  item_name: string
  item_description: string
  location_lost: string
  date_lost: string
  owner_name: string
  contact_info?: string
  status: 'active' | 'found' | 'expired'
  created_at: string
  updated_at: string
}

export interface CreateFindData {
  user_id?: number | string  // Made optional for anonymous submissions
  item_name: string
  item_description: string
  description?: string  // Alternative field name
  category?: string     // Added category field
  location_found: string
  date_found: string
  image_url?: string
  contact_info?: string | object
}

export interface CreateLossData {
  user_id: number
  item_name: string
  item_description: string
  location_lost: string
  date_lost: string
  owner_name: string
  contact_info?: string
}

// Mock data storage
let mockFinds: Find[] = []
let mockLosses: Loss[] = []
let nextFindId = 1
let nextLossId = 1

// Mock functions that simulate database operations
export const createFind = async (findData: CreateFindData) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newFind: Find = {
      id: nextFindId++,
      user_id: findData.user_id,
      item_name: findData.item_name,
      item_description: findData.item_description,
      location_found: findData.location_found,
      date_found: findData.date_found,
      image_url: findData.image_url,
      contact_info: findData.contact_info,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockFinds.push(newFind)
    
    // Store in localStorage for persistence
    localStorage.setItem('mockFinds', JSON.stringify(mockFinds))
    
    console.log('Mock: Created find record:', newFind)
    return { data: newFind, error: null }
  } catch (error) {
    console.error('Mock: Error creating find:', error)
    return { data: null, error }
  }
}

export const createLoss = async (lossData: CreateLossData) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newLoss: Loss = {
      id: nextLossId++,
      user_id: lossData.user_id,
      item_name: lossData.item_name,
      item_description: lossData.item_description,
      location_lost: lossData.location_lost,
      date_lost: lossData.date_lost,
      owner_name: lossData.owner_name,
      contact_info: lossData.contact_info,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockLosses.push(newLoss)
    
    // Store in localStorage for persistence
    localStorage.setItem('mockLosses', JSON.stringify(mockLosses))
    
    console.log('Mock: Created loss record:', newLoss)
    return { data: newLoss, error: null }
  } catch (error) {
    console.error('Mock: Error creating loss:', error)
    return { data: null, error }
  }
}

export const getUserFinds = async (userId: number) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const userFinds = mockFinds.filter(find => find.user_id === userId)
    return { data: userFinds, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getUserLosses = async (userId: number) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const userLosses = mockLosses.filter(loss => loss.user_id === userId)
    return { data: userLosses, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getAllFinds = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return { data: mockFinds.filter(find => find.status === 'available'), error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getAllLosses = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return { data: mockLosses.filter(loss => loss.status === 'active'), error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const uploadFindImage = async (file: File, findId: number) => {
  try {
    // Simulate image upload
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create a mock URL
    const mockImageUrl = `https://mock-images.com/find-${findId}-${Date.now()}.jpg`
    
    // Update the find record
    const findIndex = mockFinds.findIndex(find => find.id === findId)
    if (findIndex !== -1) {
      mockFinds[findIndex].image_url = mockImageUrl
      localStorage.setItem('mockFinds', JSON.stringify(mockFinds))
    }
    
    console.log('Mock: Uploaded image:', mockImageUrl)
    return { data: mockImageUrl, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Initialize mock data from localStorage on module load
if (typeof window !== 'undefined') {
  try {
    const storedFinds = localStorage.getItem('mockFinds')
    if (storedFinds) {
      mockFinds = JSON.parse(storedFinds)
      nextFindId = Math.max(...mockFinds.map(f => f.id), 0) + 1
    }
    
    const storedLosses = localStorage.getItem('mockLosses')
    if (storedLosses) {
      mockLosses = JSON.parse(storedLosses)
      nextLossId = Math.max(...mockLosses.map(l => l.id), 0) + 1
    }
  } catch (error) {
    console.error('Error loading mock data from localStorage:', error)
  }
}
