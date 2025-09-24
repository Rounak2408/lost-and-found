import { supabase } from '../supabase/client'

export interface Notification {
  id: number
  user_id: number
  type: 'find' | 'loss' | 'match' | 'system'
  title: string
  message: string
  item_name?: string
  location?: string
  date_occurred?: string
  contact_info?: string
  image_url?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface CreateNotificationData {
  user_id: number
  type: 'find' | 'loss' | 'match' | 'system'
  title: string
  message: string
  item_name?: string
  location?: string
  date_occurred?: string
  contact_info?: string
  image_url?: string
}

// Create a single notification
export const createNotification = async (notificationData: CreateNotificationData) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Send notification to all users
export const sendCommunityNotification = async (notificationData: Omit<CreateNotificationData, 'user_id'>) => {
  try {
    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true)

    if (usersError) {
      throw usersError
    }

    if (!users || users.length === 0) {
      return { success: true, message: 'No active users to notify' }
    }

    // Create notifications for all users
    const notifications = users.map(user => ({
      ...notificationData,
      user_id: user.id
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) {
      throw error
    }

    return { success: true, message: `Notification sent to ${users.length} users` }
  } catch (error) {
    return { success: false, error }
  }
}

// Get notifications for a specific user
export const getUserNotifications = async (userId: number, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Get unread notifications count for a user
export const getUnreadNotificationsCount = async (userId: number) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      throw error
    }

    return { count: count || 0, error: null }
  } catch (error) {
    return { count: 0, error }
  }
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: number) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}

// Delete old notifications (cleanup function)
export const deleteOldNotifications = async (daysOld: number = 30) => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}
