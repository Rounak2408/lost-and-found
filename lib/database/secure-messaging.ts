// Secure in-app messaging system for verified users
// This system enables safe communication between users for item returns

export interface Message {
  id: string
  conversationId: string
  senderId: number
  receiverId: number
  content: string
  messageType: 'text' | 'image' | 'location' | 'meetup_request' | 'meetup_confirmed' | 'meetup_completed'
  metadata?: any
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  participants: number[]
  itemId: number
  itemType: 'find' | 'loss'
  itemName: string
  status: 'active' | 'completed' | 'blocked' | 'reported'
  lastMessage?: Message
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface MeetupRequest {
  id: string
  conversationId: string
  requesterId: number
  requestedId: number
  proposedLocation: string
  proposedTime: string
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'
  actualLocation?: string
  actualTime?: string
  safetyNotes?: string
  createdAt: string
  updatedAt: string
}

export interface SafetyReport {
  id: string
  reporterId: number
  reportedUserId: number
  conversationId: string
  reason: 'inappropriate_behavior' | 'suspicious_activity' | 'safety_concern' | 'spam' | 'other'
  description: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string
  updatedAt: string
}

// Mock storage
let mockMessages: Message[] = []
let mockConversations: Conversation[] = []
let mockMeetupRequests: MeetupRequest[] = []
let mockSafetyReports: SafetyReport[] = []
let nextMessageId = 1
let nextConversationId = 1
let nextMeetupId = 1
let nextReportId = 1

// Initialize from localStorage
if (typeof window !== 'undefined') {
  try {
    const storedMessages = localStorage.getItem('mockMessages')
    if (storedMessages) {
      mockMessages = JSON.parse(storedMessages)
      nextMessageId = Math.max(...mockMessages.map(m => parseInt(m.id)), 0) + 1
    }
    
    const storedConversations = localStorage.getItem('mockConversations')
    if (storedConversations) {
      mockConversations = JSON.parse(storedConversations)
      nextConversationId = Math.max(...mockConversations.map(c => parseInt(c.id)), 0) + 1
    }
    
    const storedMeetups = localStorage.getItem('mockMeetupRequests')
    if (storedMeetups) {
      mockMeetupRequests = JSON.parse(storedMeetups)
      nextMeetupId = Math.max(...mockMeetupRequests.map(m => parseInt(m.id)), 0) + 1
    }
    
    const storedReports = localStorage.getItem('mockSafetyReports')
    if (storedReports) {
      mockSafetyReports = JSON.parse(storedReports)
      nextReportId = Math.max(...mockSafetyReports.map(r => parseInt(r.id)), 0) + 1
    }
  } catch (error) {
    console.error('Error loading messaging data from localStorage:', error)
  }
}

// Create or get conversation
export function getOrCreateConversation(userId1: number, userId2: number, itemId: number, itemType: 'find' | 'loss', itemName: string): Conversation {
  // Check if conversation already exists
  let conversation = mockConversations.find(c => 
    c.participants.includes(userId1) && 
    c.participants.includes(userId2) && 
    c.itemId === itemId
  )
  
  if (!conversation) {
    const conversationId = nextConversationId++
    conversation = {
      id: conversationId.toString(),
      participants: [userId1, userId2],
      itemId,
      itemType,
      itemName,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockConversations.push(conversation)
    localStorage.setItem('mockConversations', JSON.stringify(mockConversations))
  }
  
  return conversation
}

// Send message
export async function sendMessage(
  senderId: number, 
  receiverId: number, 
  content: string, 
  itemId: number, 
  itemType: 'find' | 'loss',
  itemName: string,
  messageType: Message['messageType'] = 'text',
  metadata?: any
): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    // Check if sender can send messages (verification check)
    const { canSendMessages } = await import('./verification')
    if (!canSendMessages(senderId)) {
      return {
        success: false,
        error: 'You need to verify your identity to send messages'
      }
    }
    
    // Get or create conversation
    const conversation = getOrCreateConversation(senderId, receiverId, itemId, itemType, itemName)
    
    // Create message
    const messageId = nextMessageId++
    const message: Message = {
      id: messageId.toString(),
      conversationId: conversation.id,
      senderId,
      receiverId,
      content,
      messageType,
      metadata,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockMessages.push(message)
    
    // Update conversation
    conversation.lastMessage = message
    conversation.lastMessageAt = message.createdAt
    conversation.updatedAt = new Date().toISOString()
    
    localStorage.setItem('mockMessages', JSON.stringify(mockMessages))
    localStorage.setItem('mockConversations', JSON.stringify(mockConversations))
    
    console.log(`💬 Message sent: ${senderId} → ${receiverId}: ${content}`)
    
    return {
      success: true,
      message
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send message'
    }
  }
}

// Get user conversations
export function getUserConversations(userId: number): Conversation[] {
  return mockConversations
    .filter(c => c.participants.includes(userId))
    .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime())
}

// Get conversation messages
export function getConversationMessages(conversationId: string): Message[] {
  return mockMessages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

// Mark messages as read
export function markMessagesAsRead(conversationId: string, userId: number): void {
  const messages = mockMessages.filter(m => 
    m.conversationId === conversationId && 
    m.receiverId === userId && 
    !m.isRead
  )
  
  messages.forEach(message => {
    message.isRead = true
    message.updatedAt = new Date().toISOString()
  })
  
  localStorage.setItem('mockMessages', JSON.stringify(mockMessages))
}

// Get unread message count
export function getUnreadMessageCount(userId: number): number {
  return mockMessages.filter(m => m.receiverId === userId && !m.isRead).length
}

// Create meetup request
export async function createMeetupRequest(
  conversationId: string,
  requesterId: number,
  requestedId: number,
  proposedLocation: string,
  proposedTime: string,
  safetyNotes?: string
): Promise<{ success: boolean; meetup?: MeetupRequest; error?: string }> {
  try {
    const meetupId = nextMeetupId++
    const meetup: MeetupRequest = {
      id: meetupId.toString(),
      conversationId,
      requesterId,
      requestedId,
      proposedLocation,
      proposedTime,
      status: 'pending',
      safetyNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockMeetupRequests.push(meetup)
    localStorage.setItem('mockMeetupRequests', JSON.stringify(mockMeetupRequests))
    
    // Send meetup request message
    const conversation = mockConversations.find(c => c.id === conversationId)
    if (conversation) {
      await sendMessage(
        requesterId,
        requestedId,
        `Meetup request: ${proposedLocation} at ${proposedTime}`,
        conversation.itemId,
        conversation.itemType,
        conversation.itemName,
        'meetup_request',
        { meetupId: meetup.id }
      )
    }
    
    console.log(`🤝 Meetup request created: ${requesterId} → ${requestedId}`)
    
    return {
      success: true,
      meetup
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create meetup request'
    }
  }
}

// Respond to meetup request
export function respondToMeetupRequest(
  meetupId: string, 
  status: 'accepted' | 'declined' | 'cancelled',
  actualLocation?: string,
  actualTime?: string
): { success: boolean; error?: string } {
  try {
    const meetup = mockMeetupRequests.find(m => m.id === meetupId)
    if (!meetup) {
      return {
        success: false,
        error: 'Meetup request not found'
      }
    }
    
    meetup.status = status
    meetup.updatedAt = new Date().toISOString()
    
    if (status === 'accepted' && actualLocation && actualTime) {
      meetup.actualLocation = actualLocation
      meetup.actualTime = actualTime
    }
    
    localStorage.setItem('mockMeetupRequests', JSON.stringify(mockMeetupRequests))
    
    console.log(`🤝 Meetup request ${status}: ${meetupId}`)
    
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to respond to meetup request'
    }
  }
}

// Get user meetup requests
export function getUserMeetupRequests(userId: number): MeetupRequest[] {
  return mockMeetupRequests.filter(m => 
    m.requesterId === userId || m.requestedId === userId
  )
}

// Complete meetup
export function completeMeetup(meetupId: string): { success: boolean; error?: string } {
  try {
    const meetup = mockMeetupRequests.find(m => m.id === meetupId)
    if (!meetup) {
      return {
        success: false,
        error: 'Meetup request not found'
      }
    }
    
    meetup.status = 'completed'
    meetup.updatedAt = new Date().toISOString()
    
    localStorage.setItem('mockMeetupRequests', JSON.stringify(mockMeetupRequests))
    
    console.log(`✅ Meetup completed: ${meetupId}`)
    
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to complete meetup'
    }
  }
}

// Report safety concern
export function reportSafetyConcern(
  reporterId: number,
  reportedUserId: number,
  conversationId: string,
  reason: SafetyReport['reason'],
  description: string
): { success: boolean; reportId?: string; error?: string } {
  try {
    const reportId = nextReportId++
    const report: SafetyReport = {
      id: reportId.toString(),
      reporterId,
      reportedUserId,
      conversationId,
      reason,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockSafetyReports.push(report)
    localStorage.setItem('mockSafetyReports', JSON.stringify(mockSafetyReports))
    
    // Block conversation
    const conversation = mockConversations.find(c => c.id === conversationId)
    if (conversation) {
      conversation.status = 'reported'
      localStorage.setItem('mockConversations', JSON.stringify(mockConversations))
    }
    
    console.log(`🚨 Safety report created: ${reporterId} reported ${reportedUserId}`)
    
    return {
      success: true,
      reportId: report.id
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create safety report'
    }
  }
}

// Get safety reports
export function getSafetyReports(): SafetyReport[] {
  return mockSafetyReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Block user
export function blockUser(userId: number, blockedUserId: number): void {
  // Find conversations between users and mark as blocked
  const conversations = mockConversations.filter(c => 
    c.participants.includes(userId) && c.participants.includes(blockedUserId)
  )
  
  conversations.forEach(conversation => {
    conversation.status = 'blocked'
  })
  
  localStorage.setItem('mockConversations', JSON.stringify(mockConversations))
  console.log(`🚫 User ${userId} blocked ${blockedUserId}`)
}

// Get safe meetup suggestions
export function getSafeMeetupSuggestions(): { location: string; description: string; safetyLevel: 'high' | 'medium' | 'low' }[] {
  return [
    {
      location: 'Police Station Lobby',
      description: 'Public area with security cameras and police presence',
      safetyLevel: 'high'
    },
    {
      location: 'Shopping Mall Food Court',
      description: 'Busy public area with many people around',
      safetyLevel: 'high'
    },
    {
      location: 'Library Main Entrance',
      description: 'Quiet but public area with staff presence',
      safetyLevel: 'medium'
    },
    {
      location: 'Coffee Shop',
      description: 'Public business with staff and customers',
      safetyLevel: 'medium'
    },
    {
      location: 'Park Main Entrance',
      description: 'Public park entrance with good visibility',
      safetyLevel: 'medium'
    }
  ]
}

// Clear all messaging data (for testing)
export function clearAllMessagingData(): void {
  mockMessages = []
  mockConversations = []
  mockMeetupRequests = []
  mockSafetyReports = []
  nextMessageId = 1
  nextConversationId = 1
  nextMeetupId = 1
  nextReportId = 1
  
  localStorage.removeItem('mockMessages')
  localStorage.removeItem('mockConversations')
  localStorage.removeItem('mockMeetupRequests')
  localStorage.removeItem('mockSafetyReports')
}
