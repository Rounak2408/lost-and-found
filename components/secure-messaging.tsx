'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  Send, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield, 
  AlertTriangle,
  User,
  Calendar,
  Phone,
  Mail,
  Flag,
  Camera,
  Paperclip
} from 'lucide-react'
import { 
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  createMeetupRequest,
  respondToMeetupRequest,
  getUserMeetupRequests,
  completeMeetup,
  reportSafetyConcern,
  getSafeMeetupSuggestions
} from '@/lib/database/secure-messaging'
import { getUserVerificationStatus, getVerificationBadge, canSendMessages } from '@/lib/database/verification'

interface SecureMessagingProps {
  userId: number
  itemId?: number
  itemType?: 'find' | 'loss'
  itemName?: string
  otherUserId?: number
}

export default function SecureMessaging({ 
  userId, 
  itemId, 
  itemType, 
  itemName, 
  otherUserId 
}: SecureMessagingProps) {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showMeetupDialog, setShowMeetupDialog] = useState(false)
  const [meetupData, setMeetupData] = useState({
    location: '',
    time: '',
    safetyNotes: ''
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
    loadUnreadCount()
  }, [userId])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      markMessagesAsRead(selectedConversation.id, userId)
    }
  }, [selectedConversation, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = () => {
    try {
      const userConversations = getUserConversations(userId)
      setConversations(userConversations)
      
      // Auto-select conversation if itemId and otherUserId are provided
      if (itemId && otherUserId) {
        const conversation = userConversations.find(c => 
          c.itemId === itemId && c.participants.includes(otherUserId)
        )
        if (conversation) {
          setSelectedConversation(conversation)
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadMessages = (conversationId: string) => {
    try {
      const conversationMessages = getConversationMessages(conversationId)
      setMessages(conversationMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadUnreadCount = () => {
    try {
      const count = getUnreadMessageCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setLoading(true)
    setMessage('')

    try {
      const result = await sendMessage(
        userId,
        selectedConversation.participants.find((id: number) => id !== userId),
        newMessage,
        selectedConversation.itemId,
        selectedConversation.itemType,
        selectedConversation.itemName
      )

      if (result.success) {
        setNewMessage('')
        loadMessages(selectedConversation.id)
        loadConversations()
        setMessage('✅ Message sent successfully')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeetup = async () => {
    if (!selectedConversation || !meetupData.location || !meetupData.time) return

    setLoading(true)
    setMessage('')

    try {
      const result = await createMeetupRequest(
        selectedConversation.id,
        userId,
        selectedConversation.participants.find((id: number) => id !== userId),
        meetupData.location,
        meetupData.time,
        meetupData.safetyNotes
      )

      if (result.success) {
        setShowMeetupDialog(false)
        setMeetupData({ location: '', time: '', safetyNotes: '' })
        loadMessages(selectedConversation.id)
        setMessage('✅ Meetup request sent')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to create meetup request')
    } finally {
      setLoading(false)
    }
  }

  const handleReportSafety = () => {
    if (!selectedConversation) return

    const description = prompt('Please describe the safety concern:')
    if (!description) return

    try {
      const result = reportSafetyConcern(
        userId,
        selectedConversation.participants.find((id: number) => id !== userId),
        selectedConversation.id,
        'safety_concern',
        description
      )

      if (result.success) {
        setMessage('✅ Safety report submitted. The conversation has been blocked.')
        loadConversations()
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to submit safety report')
    }
  }

  const canSend = canSendMessages(userId)
  const safeLocations = getSafeMeetupSuggestions()

  if (!canSend) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert className="border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You need to verify your identity to send secure messages. Please complete the verification process first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full h-[600px] flex border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </h3>
        </div>
        
        <ScrollArea className="h-[550px]">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-100 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="font-medium text-sm">{conversation.itemName}</div>
                <div className="text-xs text-muted-foreground">
                  {conversation.itemType === 'find' ? 'Found Item' : 'Lost Item'}
                </div>
                {conversation.lastMessage && (
                  <div className="text-xs text-gray-600 truncate">
                    {conversation.lastMessage.content}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {conversation.lastMessageAt && new Date(conversation.lastMessageAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedConversation.itemName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.itemType === 'find' ? 'Found Item' : 'Lost Item'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showMeetupDialog} onOpenChange={setShowMeetupDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4 mr-1" />
                        Meetup
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Safe Meetup</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Location</label>
                          <select
                            value={meetupData.location}
                            onChange={(e) => setMeetupData({...meetupData, location: e.target.value})}
                            className="w-full p-2 border rounded-md"
                            title="Select safe meetup location"
                          >
                            <option value="">Select a safe location</option>
                            {safeLocations.map((location, index) => (
                              <option key={index} value={location.location}>
                                {location.location} - {location.description}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date & Time</label>
                          <Input
                            type="datetime-local"
                            value={meetupData.time}
                            onChange={(e) => setMeetupData({...meetupData, time: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Safety Notes (Optional)</label>
                          <Textarea
                            value={meetupData.safetyNotes}
                            onChange={(e) => setMeetupData({...meetupData, safetyNotes: e.target.value})}
                            placeholder="Any additional safety considerations..."
                          />
                        </div>
                        <Button 
                          onClick={handleCreateMeetup}
                          disabled={loading || !meetupData.location || !meetupData.time}
                          className="w-full"
                        >
                          {loading ? 'Sending...' : 'Send Meetup Request'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button size="sm" variant="outline" onClick={handleReportSafety}>
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.senderId === userId
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">{msg.content}</div>
                      <div className={`text-xs mt-1 ${
                        msg.senderId === userId ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className="absolute top-4 right-4 z-50">
          <Alert className={message.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
