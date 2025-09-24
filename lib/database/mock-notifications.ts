// Mock notification system for when Supabase is not configured

export interface NotificationData {
  type: 'find' | 'loss'
  title: string
  message: string
  item_name: string
  location: string
  date_occurred: string
  contact_info?: string
  image_url?: string
  user_name?: string
  user_email?: string
}

export interface NotificationResult {
  success: boolean
  error?: string
}

// Mock notifications storage - using a shared key for cross-user notifications
const SHARED_NOTIFICATIONS_KEY = 'sharedCommunityNotifications'
let mockNotifications: Array<NotificationData & { id: number; created_at: string; is_read?: boolean }> = []
let nextNotificationId = 1

export const sendCommunityNotification = async (notificationData: NotificationData): Promise<NotificationResult> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const notification = {
      id: nextNotificationId++,
      ...notificationData,
      created_at: new Date().toISOString(),
      is_read: false
    }
    
    mockNotifications.push(notification)
    
    // Store in localStorage with shared key for cross-user access
    localStorage.setItem(SHARED_NOTIFICATIONS_KEY, JSON.stringify(mockNotifications))
    
    console.log('Mock: Sent notification:', notification)
    
    return { success: true }
  } catch (error) {
    console.error('Mock: Error sending notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

export const getNotifications = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Load from shared localStorage key
    const storedNotifications = localStorage.getItem(SHARED_NOTIFICATIONS_KEY)
    if (storedNotifications) {
      mockNotifications = JSON.parse(storedNotifications)
    }
    
    return { data: mockNotifications, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Create sample notifications for demonstration
export const createSampleNotifications = () => {
  const sampleNotifications = [
    {
      id: nextNotificationId++,
      type: 'find' as const,
      title: '🔍 Item Found: iPhone 13',
      message: 'Someone found an iPhone 13 in the library. Check if this might be yours!',
      item_name: 'iPhone 13',
      location: 'Central Library',
      date_occurred: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 hours ago
      contact_info: 'Call: 555-0123',
      image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', // Sample iPhone image
      user_name: 'Sarah Johnson',
      user_email: 'sarah@example.com',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_read: false
    },
    {
      id: nextNotificationId++,
      type: 'loss' as const,
      title: '📱 Item Lost: Blue Backpack',
      message: 'Someone lost a blue backpack with laptop inside. Help them find it!',
      item_name: 'Blue Backpack',
      location: 'University Campus',
      date_occurred: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 hours ago
      contact_info: 'Email: john@example.com',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', // Sample backpack image
      user_name: 'John Smith',
      user_email: 'john@example.com',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      is_read: false
    },
    {
      id: nextNotificationId++,
      type: 'find' as const,
      title: '🔍 Item Found: Red Wallet',
      message: 'A red leather wallet was found in the cafeteria. Contains ID and credit cards.',
      item_name: 'Red Wallet',
      location: 'Student Cafeteria',
      date_occurred: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 hours ago
      contact_info: 'Text: 555-0456',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', // Sample wallet image
      user_name: 'Mike Wilson',
      user_email: 'mike@example.com',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      is_read: true
    }
  ]
  
  mockNotifications = [...sampleNotifications, ...mockNotifications]
  localStorage.setItem(SHARED_NOTIFICATIONS_KEY, JSON.stringify(mockNotifications))
  
  return sampleNotifications
}

// Initialize mock notifications from localStorage on module load
if (typeof window !== 'undefined') {
  try {
    const storedNotifications = localStorage.getItem(SHARED_NOTIFICATIONS_KEY)
    if (storedNotifications) {
      mockNotifications = JSON.parse(storedNotifications)
      nextNotificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1
    } else {
      // Create sample notifications if none exist
      createSampleNotifications()
    }
  } catch (error) {
    console.error('Error loading mock notifications from localStorage:', error)
  }
}
