'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  User, 
  Mail,
  Phone,
  Eye,
  Target,
  AlertCircle
} from 'lucide-react'
import type { MatchNotification } from '@/lib/database/auto-matching'
import { getUserMatches, updateMatchStatus, markMatchAsRead } from '@/lib/database/auto-matching'

interface MatchNotificationsProps {
  userId: number
}

export default function MatchNotifications({ userId }: MatchNotificationsProps) {
  const [matches, setMatches] = useState<MatchNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<MatchNotification | null>(null)

  useEffect(() => {
    loadMatches()
  }, [userId])

  const loadMatches = () => {
    try {
      const userMatches = getUserMatches(userId)
      setMatches(userMatches)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimMatch = (matchId: string) => {
    updateMatchStatus(matchId, 'claimed')
    markMatchAsRead(matchId)
    loadMatches()
    
    // Show success message
    alert('🎉 Match claimed! We\'ll notify the other party and help coordinate the return.')
  }

  const handleRejectMatch = (matchId: string) => {
    updateMatchStatus(matchId, 'rejected')
    markMatchAsRead(matchId)
    loadMatches()
  }

  const handleViewDetails = (match: MatchNotification) => {
    setSelectedMatch(match)
    markMatchAsRead(match.id)
    loadMatches()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (confidence >= 0.4) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Very High'
    if (confidence >= 0.6) return 'High'
    if (confidence >= 0.4) return 'Medium'
    return 'Low'
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Potential Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading matches...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Potential Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No potential matches found yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll notify you when we find items that might match yours!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Potential Matches ({matches.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id} className={`border-l-4 ${match.isRead ? 'border-l-gray-300' : 'border-l-blue-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{match.itemName}</h3>
                        <Badge className={getConfidenceColor(match.matchConfidence)}>
                          {getConfidenceText(match.matchConfidence)} Match
                        </Badge>
                        {!match.isRead && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{match.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(match.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {match.finderUserId === userId ? match.loserName : match.finderName}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(match)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        
                        {match.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleClaimMatch(match.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Claim Match
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectMatch(match.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Not Mine
                            </Button>
                          </>
                        )}
                        
                        {match.status === 'claimed' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Claimed
                          </Badge>
                        )}
                        
                        {match.status === 'rejected' && (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        {/* Match Details Dialog */}
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Match Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedMatch && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{selectedMatch.itemName}</h3>
                  <Badge className={getConfidenceColor(selectedMatch.matchConfidence)}>
                    {getConfidenceText(selectedMatch.matchConfidence)} Match
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">{selectedMatch.message}</p>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Finder Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedMatch.finderName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedMatch.finderEmail}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Owner Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedMatch.loserName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedMatch.loserEmail}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    Match confidence: {Math.round(selectedMatch.matchConfidence * 100)}%
                  </span>
                </div>
                
                {selectedMatch.status === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        handleClaimMatch(selectedMatch.id)
                        setSelectedMatch(null)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Claim This Match
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleRejectMatch(selectedMatch.id)
                        setSelectedMatch(null)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Not My Item
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
