// Automatic matching system for lost and found items
// This system detects when someone reports a lost item and another person reports finding the same type of item

import { sendCommunityNotification } from './shared-notifications'
import { getAllFinds, getAllLosses } from './finds-losses'
import type { Find, Loss } from './finds-losses'

export interface MatchResult {
  findId: number
  lossId: number
  confidence: number
  matchType: 'exact' | 'similar' | 'location' | 'description'
  reasons: string[]
}

export interface MatchNotification {
  id: string
  type: 'potential_match'
  title: string
  message: string
  findId: number
  lossId: number
  finderUserId: number
  loserUserId: number
  finderName: string
  loserName: string
  finderEmail: string
  loserEmail: string
  itemName: string
  matchConfidence: number
  createdAt: string
  isRead: boolean
  status: 'pending' | 'claimed' | 'rejected' | 'expired'
}

// Mock storage for matches
let mockMatches: MatchNotification[] = []
let nextMatchId = 1

// Initialize from localStorage
if (typeof window !== 'undefined') {
  try {
    const storedMatches = localStorage.getItem('mockMatches')
    if (storedMatches) {
      mockMatches = JSON.parse(storedMatches)
      nextMatchId = Math.max(...mockMatches.map(m => parseInt(m.id)), 0) + 1
    }
  } catch (error) {
    console.error('Error loading matches from localStorage:', error)
  }
}

// Text similarity function (simple implementation)
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  
  const commonWords = words1.filter(word => words2.includes(word))
  const totalWords = new Set([...words1, ...words2]).size
  
  return totalWords > 0 ? commonWords.length / totalWords : 0
}

// Location similarity function
function calculateLocationSimilarity(loc1: string, loc2: string): number {
  const loc1Lower = loc1.toLowerCase()
  const loc2Lower = loc2.toLowerCase()
  
  // Check for exact match
  if (loc1Lower === loc2Lower) return 1.0
  
  // Check for partial match (one location contains the other)
  if (loc1Lower.includes(loc2Lower) || loc2Lower.includes(loc1Lower)) return 0.8
  
  // Check for common words
  const words1 = loc1Lower.split(/[\s,]+/)
  const words2 = loc2Lower.split(/[\s,]+/)
  const commonWords = words1.filter(word => words2.includes(word))
  
  return commonWords.length > 0 ? commonWords.length / Math.max(words1.length, words2.length) : 0
}

// Date proximity function (items found/lost within reasonable time)
function calculateDateProximity(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffDays = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)
  
  // Within 7 days = high confidence
  if (diffDays <= 7) return 1.0
  // Within 30 days = medium confidence
  if (diffDays <= 30) return 0.7
  // Within 90 days = low confidence
  if (diffDays <= 90) return 0.3
  // Beyond 90 days = very low confidence
  return 0.1
}

// Main matching algorithm
export async function findPotentialMatches(find: Find): Promise<MatchResult[]> {
  try {
    const { data: losses } = await getAllLosses()
    if (!losses) return []
    
    const matches: MatchResult[] = []
    
    for (const loss of losses) {
      // Skip if same user
      if (find.user_id === loss.user_id) continue
      
      // Skip if loss is already resolved
      if (loss.status !== 'active') continue
      
      let confidence = 0
      const reasons: string[] = []
      
      // 1. Item name similarity (most important)
      const nameSimilarity = calculateTextSimilarity(find.item_name, loss.item_name)
      if (nameSimilarity > 0.7) {
        confidence += nameSimilarity * 0.4
        reasons.push(`Item names are very similar: "${find.item_name}" vs "${loss.item_name}"`)
      } else if (nameSimilarity > 0.4) {
        confidence += nameSimilarity * 0.3
        reasons.push(`Item names are somewhat similar: "${find.item_name}" vs "${loss.item_name}"`)
      }
      
      // 2. Description similarity
      const descSimilarity = calculateTextSimilarity(find.item_description, loss.item_description)
      if (descSimilarity > 0.3) {
        confidence += descSimilarity * 0.3
        reasons.push(`Descriptions have similar details`)
      }
      
      // 3. Location proximity
      const locationSimilarity = calculateLocationSimilarity(find.location_found, loss.location_lost)
      if (locationSimilarity > 0.5) {
        confidence += locationSimilarity * 0.2
        reasons.push(`Locations are close: found at "${find.location_found}", lost at "${loss.location_lost}"`)
      }
      
      // 4. Date proximity
      const dateSimilarity = calculateDateProximity(find.date_found, loss.date_lost)
      if (dateSimilarity > 0.3) {
        confidence += dateSimilarity * 0.1
        reasons.push(`Dates are close: found on ${find.date_found}, lost on ${loss.date_lost}`)
      }
      
      // Only consider matches with reasonable confidence
      if (confidence > 0.3) {
        let matchType: 'exact' | 'similar' | 'location' | 'description' = 'similar'
        
        if (nameSimilarity > 0.8 && locationSimilarity > 0.7) {
          matchType = 'exact'
        } else if (locationSimilarity > 0.7) {
          matchType = 'location'
        } else if (descSimilarity > 0.5) {
          matchType = 'description'
        }
        
        matches.push({
          findId: find.id,
          lossId: loss.id,
          confidence,
          matchType,
          reasons
        })
      }
    }
    
    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence)
  } catch (error) {
    console.error('Error finding potential matches:', error)
    return []
  }
}

// Create match notifications for both parties
export async function createMatchNotifications(find: Find, matches: MatchResult[]): Promise<void> {
  try {
    const { data: losses } = await getAllLosses()
    if (!losses) return
    
    for (const match of matches) {
      const loss = losses.find(l => l.id === match.lossId)
      if (!loss) continue
      
      // Get user details (mock implementation)
      const finderUser = JSON.parse(localStorage.getItem('user') || '{}')
      const loserUser = JSON.parse(localStorage.getItem('user') || '{}') // In real app, fetch by user_id
      
      const matchId = nextMatchId++
      const matchNotification: MatchNotification = {
        id: matchId.toString(),
        type: 'potential_match',
        title: `🎯 Potential Match Found!`,
        message: `We found a potential match for your ${loss.item_name}. Someone found a ${find.item_name} that might be yours!`,
        findId: find.id,
        lossId: loss.id,
        finderUserId: find.user_id,
        loserUserId: loss.user_id,
        finderName: finderUser.first_name || 'Unknown',
        loserName: loserUser.first_name || 'Unknown',
        finderEmail: finderUser.email || 'unknown@example.com',
        loserEmail: loserUser.email || 'unknown@example.com',
        itemName: find.item_name,
        matchConfidence: match.confidence,
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'pending'
      }
      
      mockMatches.push(matchNotification)
      
      // Send notification to both parties
      await sendCommunityNotification({
        type: 'potential_match',
        title: matchNotification.title,
        message: matchNotification.message,
        item_name: find.item_name,
        location: find.location_found,
        date_occurred: find.date_found,
        contact_info: find.contact_info,
        image_url: find.image_url,
        user_name: finderUser.first_name || 'Unknown',
        user_email: finderUser.email || 'unknown@example.com',
        matchConfidence: match.confidence,
        reasons: match.reasons.join('; ')
      })
      
      console.log(`Created match notification: ${find.item_name} ↔ ${loss.item_name} (confidence: ${match.confidence})`)
    }
    
    // Store matches in localStorage
    localStorage.setItem('mockMatches', JSON.stringify(mockMatches))
  } catch (error) {
    console.error('Error creating match notifications:', error)
  }
}

// Get matches for a specific user
export function getUserMatches(userId: number): MatchNotification[] {
  return mockMatches.filter(match => 
    match.finderUserId === userId || match.loserUserId === userId
  )
}

// Update match status (when someone claims or rejects)
export function updateMatchStatus(matchId: string, status: 'claimed' | 'rejected' | 'expired'): void {
  const matchIndex = mockMatches.findIndex(m => m.id === matchId)
  if (matchIndex !== -1) {
    mockMatches[matchIndex].status = status
    localStorage.setItem('mockMatches', JSON.stringify(mockMatches))
  }
}

// Mark match as read
export function markMatchAsRead(matchId: string): void {
  const matchIndex = mockMatches.findIndex(m => m.id === matchId)
  if (matchIndex !== -1) {
    mockMatches[matchIndex].isRead = true
    localStorage.setItem('mockMatches', JSON.stringify(mockMatches))
  }
}

// Get all matches (for admin/testing)
export function getAllMatches(): MatchNotification[] {
  return mockMatches
}

// Clear all matches (for testing)
export function clearAllMatches(): void {
  mockMatches = []
  nextMatchId = 1
  localStorage.removeItem('mockMatches')
}
