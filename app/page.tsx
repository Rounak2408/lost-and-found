'use client'

import { Search, MapPin, Camera, Shield, Users, Clock, CheckCircle, AlertCircle, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LanguageSelect } from "@/components/language-select"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useI18n()

  const handleSearch = () => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      // User not logged in, redirect to auth page
      router.push('/auth')
      return
    }
    
    // User is logged in, redirect to search page with query
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/search')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SmartFind</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Lost & Found Management</p>
                </div>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              <a href="#search" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {t('nav.search')}
              </a>
              <a href="/dashboard/loss" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {t('nav.reportLost')}
              </a>
              <a href="/dashboard/find" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {t('nav.reportFound')}
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {t('nav.howItWorks')}
              </a>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme & Language */}
              <ThemeSwitcher />
              <LanguageSelect compact />

              {/* Auth Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                  <a href="/auth">{t('auth.signIn')}</a>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5" asChild>
                  <a href="/auth">{t('auth.signUp')}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-16 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 text-xs sm:text-sm">AI-Powered Matching</Badge>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-balance mb-4 sm:mb-6">{t('hero.title')}</h1>
            <p className="text-sm sm:text-xl text-muted-foreground text-pretty mb-6 sm:mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Quick Search Bar */}
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('hero.searchPlaceholder')}
                    className="pl-10 h-10 sm:h-12 text-sm sm:text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 focus:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 sm:px-8 h-10 sm:h-12 text-sm sm:text-base"
                  onClick={handleSearch}
                >
                  {t('hero.searchButton')}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base" asChild>
                <a href="/dashboard/loss">
                  <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {t('hero.cta.reportLost')}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent text-sm sm:text-base"
                asChild
              >
                <a href="/search">
                  <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {t('hero.cta.browseFound')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-16" id="how-it-works">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('how.title')}</h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
              Our intelligent system makes finding lost items simple and efficient through smart matching technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <Card className="group border-border hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 transition-all duration-300 ease-out text-center cursor-pointer hover:border-accent/30 bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-accent/5">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300 ease-out">
                  <Plus className="h-8 w-8 text-accent group-hover:text-accent group-hover:rotate-90 transition-all duration-300 ease-out" />
                </div>
                <CardTitle>{t('how.step1.title')}</CardTitle>
                <CardDescription>
                  {t('how.step1.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Upload photos and descriptions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Add location and time details
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Set contact preferences
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group border-border hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 transition-all duration-300 ease-out text-center cursor-pointer hover:border-accent/30 bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-accent/5">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300 ease-out">
                  <Search className="h-8 w-8 text-accent group-hover:text-accent group-hover:scale-110 transition-all duration-300 ease-out" />
                </div>
                <CardTitle>{t('how.step2.title')}</CardTitle>
                <CardDescription>
                  {t('how.step2.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Image recognition technology
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Location-based matching
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Real-time notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group border-border hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 transition-all duration-300 ease-out text-center cursor-pointer hover:border-accent/30 bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-accent/5">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300 ease-out">
                  <Shield className="h-8 w-8 text-accent group-hover:text-accent group-hover:scale-110 transition-all duration-300 ease-out" />
                </div>
                <CardTitle>{t('how.step3.title')}</CardTitle>
                <CardDescription>
                  {t('how.step3.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Identity verification process
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Secure in-app messaging
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                    Safe meetup coordination
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('stats.title')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('stats.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">15,000+</div>
              <div className="text-muted-foreground">{t('stats.itemsReported')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">8,500+</div>
              <div className="text-muted-foreground">{t('stats.successfulMatches')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">25,000+</div>
              <div className="text-muted-foreground">{t('stats.activeUsers')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">95%</div>
              <div className="text-muted-foreground">{t('stats.successRate')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Camera className="h-10 w-10 text-accent mb-2" />
                <CardTitle>{t('feature.photo.title')}</CardTitle>
                <CardDescription>
                  {t('feature.photo.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="h-10 w-10 text-accent mb-2" />
                <CardTitle>{t('feature.location.title')}</CardTitle>
                <CardDescription>
                  {t('feature.location.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-accent mb-2" />
                <CardTitle>{t('feature.alerts.title')}</CardTitle>
                <CardDescription>
                  {t('feature.alerts.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-accent mb-2" />
                <CardTitle>{t('feature.verification.title')}</CardTitle>
                <CardDescription>
                  {t('feature.verification.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-accent mb-2" />
                <CardTitle>{t('feature.community.title')}</CardTitle>
                <CardDescription>
                  {t('feature.community.desc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <AlertCircle className="h-10 w-10 text-accent mb-2" />
                <CardTitle>{t('feature.categories.title')}</CardTitle>
                <CardDescription>
                  {t('feature.categories.desc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black dark:bg-black bg-white dark:text-white text-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700 dark:text-white" asChild>
                <a href="/search">
                  <Plus className="mr-2 h-5 w-5" />
                  {t('cta.reportLost')}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black bg-transparent transition-all duration-200 font-medium"
                asChild
              >
                <a href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  {t('cta.searchFound')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-6 w-6 text-accent" />
                <span className="font-bold text-foreground">SmartFind</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t('footer.quick')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.reportLost')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.reportFound')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.searchItems')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.myAccount')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.helpCenter')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.safety')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.contact')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.community')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.about')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.privacy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.terms')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    {t('footer.careers')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025 Rounak. All rights reserved. | Connecting people with their belongings through smart
              technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
