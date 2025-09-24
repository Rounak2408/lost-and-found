// Shared notification system that simulates cross-user notifications
// This simulates a real database where all users see the same notifications

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

// Simulated shared database - in a real app, this would be a server-side database
class SharedNotificationStore {
  private notifications: Array<NotificationData & { id: number; created_at: string; is_read?: boolean }> = []
  private nextId = 1

  // Simulate network delay
  private async delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Add a new notification
  async addNotification(notificationData: NotificationData) {
    await this.delay()
    
    const notification = {
      id: this.nextId++,
      ...notificationData,
      created_at: new Date().toISOString(),
      is_read: false
    }
    
    this.notifications.push(notification)
    
    // Also store in localStorage for persistence across browser sessions
    // This simulates how a real app would cache data locally
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharedCommunityNotifications', JSON.stringify(this.notifications))
    }
    
    console.log('Shared: Added notification:', notification)
    return { success: true }
  }

  // Get all notifications
  async getNotifications() {
    await this.delay(200)
    
    // Load from localStorage if available (simulates cache)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sharedCommunityNotifications')
      if (stored) {
        try {
          this.notifications = JSON.parse(stored)
          this.nextId = Math.max(...this.notifications.map(n => n.id), 0) + 1
        } catch (error) {
          console.error('Error loading notifications from cache:', error)
        }
      }
    }
    
    return { data: this.notifications, error: null }
  }

  // Mark notification as read
  async markAsRead(notificationId: number) {
    await this.delay(100)
    
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.is_read = true
      
      // Update localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('sharedCommunityNotifications', JSON.stringify(this.notifications))
      }
    }
    
    return { success: true }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    await this.delay(100)
    
    this.notifications.forEach(n => n.is_read = true)
    
    // Update localStorage cache
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharedCommunityNotifications', JSON.stringify(this.notifications))
    }
    
    return { success: true }
  }

  // Initialize with sample data
  initializeSampleData() {
    if (this.notifications.length === 0) {
      const sampleNotifications = [
        {
          id: this.nextId++,
          type: 'find' as const,
          title: '🔍 Item Found: iPhone 13',
          message: 'Someone found an iPhone 13 in the library. Check if this might be yours!',
          item_name: 'iPhone 13',
          location: 'Central Library',
          date_occurred: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().split('T')[0],
          contact_info: 'Call: 555-0123',
          image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
          user_name: 'Sarah Johnson',
          user_email: 'sarah@example.com',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_read: false
        },
        {
          id: this.nextId++,
          type: 'loss' as const,
          title: '📱 Item Lost: Blue Backpack',
          message: 'Someone lost a blue backpack with laptop inside. Help them find it!',
          item_name: 'Blue Backpack',
          location: 'University Campus',
          date_occurred: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().split('T')[0],
          contact_info: 'Email: john@example.com',
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
          user_name: 'John Smith',
          user_email: 'john@example.com',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          is_read: false
        },
        {
          id: this.nextId++,
          type: 'find' as const,
          title: '🔍 Item Found: Red Wallet',
          message: 'A red leather wallet was found in the cafeteria. Contains ID and credit cards.',
          item_name: 'Red Wallet',
          location: 'Student Cafeteria',
          date_occurred: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split('T')[0],
          contact_info: 'Text: 555-0456',
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
          user_name: 'Mike Wilson',
          user_email: 'mike@example.com',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          is_read: true
        }
      ]
      
      this.notifications = sampleNotifications
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sharedCommunityNotifications', JSON.stringify(this.notifications))
      }
    }
  }
}

// Create a singleton instance
const sharedStore = new SharedNotificationStore()

// Initialize with sample data
sharedStore.initializeSampleData()

// Export the functions that match the expected interface
export const sendCommunityNotification = async (notificationData: NotificationData): Promise<NotificationResult> => {
  return await sharedStore.addNotification(notificationData)
}

export const getNotifications = async () => {
  return await sharedStore.getNotifications()
}

export const markNotificationAsRead = async (notificationId: number) => {
  return await sharedStore.markAsRead(notificationId)
}

export const markAllNotificationsAsRead = async () => {
  return await sharedStore.markAllAsRead()
}

export const createSampleNotifications = () => {
  sharedStore.initializeSampleData()
  return sharedStore.getNotifications()
}





