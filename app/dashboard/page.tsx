'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/components/i18n-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Search, AlertCircle, Loader2, Eye, User, MapPin, Calendar, Settings, Award, TrendingUp, Clock, Star, Shield } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { NotificationBell } from '@/components/notification-bell'
import MatchNotifications from '@/components/match-notifications'
import { getVerificationBadge, canSendMessages } from '@/lib/database/verification'
import ChatbotWidget from '@/components/chatbot-widget'
import SupportWidget from '@/components/support-widget'
import ConfettiBurst from '@/components/confetti-burst'
import DashboardActionAnimation from '@/components/dashboard-action-animation'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserStats {
  itemsFound: number
  itemsLost: number
  rewardsEarned: number
  totalRewards: number
  joinDate: string
  lastActive: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    itemsFound: 0,
    itemsLost: 0,
    rewardsEarned: 0,
    totalRewards: 0,
    joinDate: '',
    lastActive: ''
  })
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<'found' | 'lost' | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return // Prevent SSR issues
    
    setIsClient(true)
    
    // Check if user is logged in via localStorage
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('user')
        
        if (!userData) {
          router.push('/auth')
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Load user statistics (mock data for now)
        setUserStats({
          itemsFound: Math.floor(Math.random() * 20) + 1, // Random between 1-20
          itemsLost: Math.floor(Math.random() * 10) + 1,  // Random between 1-10
          rewardsEarned: Math.floor(Math.random() * 500) + 50, // Random between 50-550
          totalRewards: Math.floor(Math.random() * 1000) + 100, // Random between 100-1100
          joinDate: parsedUser.created_at || new Date().toISOString(),
          lastActive: parsedUser.updated_at || new Date().toISOString()
        })
      } catch (err) {
        console.error('Error parsing user data:', err)
        localStorage.removeItem('user') // Clear corrupted data
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }
    
    // Add a small delay to prevent rapid redirects
    const timer = setTimeout(checkUser, 100)
    
    return () => clearTimeout(timer)
  }, [router])

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('user')
      setUser(null)
      router.push('/auth')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const celebrate = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1500)
  }

  const triggerFoundAnimation = () => {
    setAnimationType('found')
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const triggerLostAnimation = () => {
    setAnimationType('lost')
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>{t('dash.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>{t('dash.redirect')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Action Animation */}
      <DashboardActionAnimation isAnimating={isAnimating} animationType={animationType} />
      
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">{t('dash.appName')}</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{t('dash.tagline')}</p>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notification Bell */}
              <NotificationBell userId={user.id} />
              
              {/* Verification Status - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2">
                {(() => {
                  const badge = getVerificationBadge(user.id)
                  const canMessage = canSendMessages(user.id)
                  return (
                    <>
                      {badge.text ? (
                        <Badge className={badge.color}>
                          {badge.text}
                        </Badge>
                      ) : null}
                      {canMessage && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          💬 {t('dash.canMessage')}
                        </Badge>
                      )}
                    </>
                  )
                })()}
              </div>
              
              {/* User Avatar - Mobile: First letter only, Desktop: Full avatar */}
              <button 
                onClick={() => router.push('/profile')}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title="Click to edit profile"
              >
                {/* Mobile: Show only first letter in circular avatar */}
                <div className="sm:hidden">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-sm">
                      {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                {/* Desktop: Show full avatar */}
                <div className="hidden sm:block">
                  <Avatar user={user as any} size="sm" />
                </div>
              </button>
              
              {/* User Info - Hidden on mobile */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              
              {/* Sign Out Button */}
              <Button variant="outline" onClick={handleSignOut} size="sm" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">{t('dash.signOut')}</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('dash.welcome').replace('{name}', user.first_name || '')}</h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8">{t('dash.subtitle')}</p>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* User Profile & Statistics Section */}
        <div className="max-w-6xl mx-auto mb-8 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3 sm:mb-4">
                  <Avatar user={user as any} size="lg" />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{user.first_name} {user.last_name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{user.email}</p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{t('dash.joined').replace('{date}', new Date(userStats.joinDate).toLocaleDateString())}</span>
                </div>
                {/* Gamification badges: one star per 5 combined items */}
                <div className="flex gap-1 mb-3 sm:mb-4 justify-center" aria-label="Achievement badges">
                  {Array.from({ length: Math.max(1, Math.floor((userStats.itemsFound + userStats.itemsLost) / 5)) }).map((_, i) => (
                    <span key={i} title="Achievement badge" className="inline-block">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    </span>
                  ))}
                </div>
                <div className="space-y-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/profile')}
                    className="w-full text-xs sm:text-sm"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t('dash.editProfile')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/verification')}
                    className="w-full text-xs sm:text-sm"
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t('dash.verifyIdentity')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Statistics Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dash.itemsFound')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{userStats.itemsFound}</p>
                    <p className="text-xs text-muted-foreground">{t('dash.helping')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dash.itemsLost')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{userStats.itemsLost}</p>
                    <p className="text-xs text-muted-foreground">{t('dash.seeking')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Search className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dash.rewardsEarned')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">₹{userStats.rewardsEarned}</p>
                    <p className="text-xs text-muted-foreground">{t('dash.fromFinds')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <Award className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('dash.totalRewards')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">₹{userStats.totalRewards}</p>
                    <p className="text-xs text-muted-foreground">{t('dash.allTime')}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Star className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          <Card className="group flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-green-500 hover:border-green-600 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-lg relative overflow-hidden min-h-[250px] sm:min-h-[300px] cursor-pointer">
            <CardHeader className="text-center relative z-10 flex flex-col items-center justify-center">
              <div className="p-4 sm:p-6 bg-green-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-green-700">
                <span className="text-white text-2xl sm:text-4xl font-bold">+</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 dark:text-green-200 mb-2 sm:mb-3 font-mono tracking-wide">{t('dash.iFound')}</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto font-light opacity-90">{t('dash.helpReunite')}</CardDescription>
            </CardHeader>
            <CardContent className="w-full relative z-10 flex justify-center">
              <Button 
                size="lg" 
                onClick={() => {
                  triggerFoundAnimation()
                  setTimeout(() => router.push('/dashboard/find'), 500)
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-base lg:text-lg group-hover:shadow-lg transition-all duration-300 border-2 border-green-700 hover:border-green-800 rounded-xl font-mono tracking-wide w-full sm:w-auto"
              >
                <span className="text-white text-sm sm:text-lg font-bold mr-2">+</span>
                {t('dash.reportFound')}
              </Button>
            </CardContent>
          </Card>

          <Card className="group flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-blue-500 hover:border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg relative overflow-hidden min-h-[250px] sm:min-h-[300px] cursor-pointer">
            <CardHeader className="text-center relative z-10 flex flex-col items-center justify-center">
              <div className="p-4 sm:p-6 bg-blue-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-blue-700">
                <span className="text-white text-2xl sm:text-4xl font-bold">?</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2 sm:mb-3 font-mono tracking-wide">{t('dash.iLost')}</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto font-light opacity-90">{t('dash.reportLostDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="w-full relative z-10 flex justify-center">
              <Button 
                size="lg" 
                onClick={() => {
                  triggerLostAnimation()
                  setTimeout(() => router.push('/dashboard/loss'), 500)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-base lg:text-lg group-hover:shadow-lg transition-all duration-300 border-2 border-blue-700 hover:border-blue-800 rounded-xl font-mono tracking-wide w-full sm:w-auto"
              >
                <span className="text-white text-sm sm:text-lg font-bold mr-2">?</span>
                {t('dash.reportLost')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('dash.communityImpact')}</h3>
            <p className="text-base sm:text-lg text-muted-foreground">{t('dash.seeHow')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
              <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400 text-sm sm:text-base">Items Found</h4>
              <p className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">12</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('dash.thisWeek')}</p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{t('dash.newThisWeek').replace('{count}', '3')}</span>
              </div>
            </Card>
            
            <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
              <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-400 text-sm sm:text-base">Items Lost</h4>
              <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">8</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('dash.thisWeek')}</p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center text-xs text-blue-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{t('dash.resolvedThisWeek').replace('{count}', '5')}</span>
              </div>
            </Card>
            
            <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </div>
              <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-400 text-sm sm:text-base">Active Users</h4>
              <p className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">156</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('dash.communityMembers')}</p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center text-xs text-purple-600">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{t('dash.newThisWeek').replace('{count}', '12')}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Match Notifications Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">🎯 {t('dash.smartMatches')}</h3>
            <p className="text-base sm:text-lg text-muted-foreground">{t('dash.smartMatchesDesc')}</p>
          </div>
          <div className="max-w-4xl mx-auto px-2 sm:px-0">
            <MatchNotifications userId={user.id} />
          </div>
        </div>
      </main>
      <ConfettiBurst active={showConfetti} onDone={() => setShowConfetti(false)} />
      <SupportWidget />
      <ChatbotWidget />
    </div>
  )
}