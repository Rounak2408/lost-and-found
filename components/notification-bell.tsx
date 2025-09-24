'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, X, Eye, MapPin, Calendar, User, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/database/shared-notifications'

interface Notification {
  id: number
  type: 'find' | 'loss'
  title: string
  message: string
  item_name: string
  location: string
  date_occurred: string
  contact_info?: string
  image_url?: string
  created_at: string
  is_read?: boolean
  user_name?: string
  user_email?: string
}

interface NotificationBellProps {
  userId: number
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Load notifications from shared system
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await getNotifications()
        if (result.data) {
          // Show all notifications to all users (community-wide)
          setNotifications(result.data)
          setUnreadCount(result.data.filter((n: Notification) => !n.is_read).length)
      }
    } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    loadNotifications()

    // Check for new notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000)

    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    return type === 'find' ? (
      <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
        <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
    ) : (
      <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
        <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      </div>
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const notificationDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-accent" />
        ) : (
          <Bell className="h-5 w-5 text-muted-foreground" />
        )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
            {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Dropdown */}
          <Card className="fixed left-1/2 -translate-x-1/2 sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 top-16 sm:top-12 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-sm z-50 shadow-lg border">
            <CardHeader className="pb-2 px-4 sm:px-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                    variant="ghost"
                  size="sm"
                    onClick={markAllAsRead}
                    className="text-xs px-2 h-6 sm:h-8"
                >
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Mark all</span>
                </Button>
              )}
            </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-72 sm:h-80 md:h-96">
                {notifications.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center text-muted-foreground">
                    <Bell className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">No notifications yet</p>
                    <p className="text-xs sm:text-sm">You'll see community updates here</p>
              </div>
            ) : (
                  <div className="space-y-1">
                    {notifications
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((notification, index) => (
                        <div key={notification.id}>
                          <div
                            className={`p-4 sm:p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                              !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
                                  <p className={`text-sm font-semibold leading-tight break-words ${
                                    !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTimeAgo(notification.created_at)}
                                  </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed break-words">
                            {notification.message}
                          </p>
                                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="break-words">{notification.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span>{new Date(notification.date_occurred).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                {notification.contact_info && (
                                  <div className="mt-3 text-xs text-muted-foreground break-words">
                                    <span className="font-semibold">Contact:</span> {notification.contact_info}
                                  </div>
                                )}
                                {notification.user_name && (
                                  <div className="mt-3 text-xs text-muted-foreground break-words">
                                    <span className="font-semibold">Reported by:</span> {notification.user_name}
                                    {notification.user_email && ` (${notification.user_email})`}
                                  </div>
                                )}
                                {notification.image_url && (
                                  <div className="mt-4">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="flex items-center gap-2 text-xs w-full h-8"
                                        >
                                          <ImageIcon className="h-3 w-3" />
                                          <span className="sm:hidden">Image</span>
                                          <span className="hidden sm:inline">View Image</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle className="text-sm sm:text-base">{notification.item_name} - Image</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center">
                                          <img 
                                            src={notification.image_url} 
                                            alt={notification.item_name}
                                            className="max-w-full max-h-96 object-contain rounded-lg"
                                            onError={(e) => {
                                              console.error('Image failed to load:', notification.image_url)
                                              e.currentTarget.style.display = 'none'
                                            }}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                )}
                              </div>
                        </div>
                      </div>
                          {index < notifications.length - 1 && <Separator />}
                        </div>
                ))}
              </div>
            )}
          </ScrollArea>
            </CardContent>
          </Card>
    </>
      )}
    </div>
  )
}
