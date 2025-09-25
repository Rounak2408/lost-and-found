'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search as SearchIcon, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { MobileControls } from '@/components/mobile-controls'
import { supabase } from '@/lib/supabase/client'

type Category = 'all' | 'electronics' | 'documents' | 'id-card' | 'bags' | 'keys' | 'others'
type Location = 'all' | 'college' | 'library' | 'hostel' | 'bus' | 'stop' | 'canteen' | 'others'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [location, setLocation] = useState<Location>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [items, setItems] = useState<Array<any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Check if user is logged in (only on client side)
  useEffect(() => {
    if (typeof window === 'undefined') return // Prevent SSR issues
    
    setIsClient(true)
    
    // Check authentication only once
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) {
          // User not logged in, redirect to auth page
          router.push('/auth')
          return
        }
        // Parse to make sure it's valid JSON
        JSON.parse(userData)
      } catch (error) {
        // If localStorage data is corrupted, clear it and redirect
        localStorage.removeItem('user')
        router.push('/auth')
      }
    }
    
    // Run check after component is mounted
    const timer = setTimeout(checkAuth, 200)
    
    return () => clearTimeout(timer)
  }, [router])

  // Handle URL query parameter from homepage search
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(decodeURIComponent(urlQuery))
    }
  }, [searchParams])

  // Placeholder items until backend wiring
  const placeholderItems = useMemo(
    () => [
      { id: '1', title: 'Black Backpack', category: 'bags', location: 'college', date: '2024-08-21' },
      { id: '2', title: 'iPhone 13 Blue', category: 'electronics', location: 'library', date: '2024-09-01' },
      { id: '3', title: 'Student ID Card', category: 'id-card', location: 'hostel', date: '2024-09-12' },
    ],
    []
  )

  // Fetch items with filters from Supabase when configured
  useEffect(() => {
    let isCancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        let q = supabase.from('items').select('*').order('created_at', { ascending: false })

        if (query.trim()) {
          q = q.ilike('title', `%${query.trim()}%`)
        }
        if (category) {
          q = q.eq('category', category)
        }
        if (location) {
          q = q.eq('location', location)
        }
        if (dateFrom) {
          q = q.gte('created_at', new Date(dateFrom).toISOString())
        }
        if (dateTo) {
          const end = new Date(dateTo)
          end.setHours(23, 59, 59, 999)
          q = q.lte('created_at', end.toISOString())
        }

        const { data, error: supaError } = await q
        if (supaError) throw supaError
        if (!isCancelled) setItems(data || [])
      } catch (err: any) {
        if (!isCancelled) setError(err?.message || 'Failed to load items')
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      run()
    } else {
      setItems(null)
    }

    return () => {
      isCancelled = true
    }
  }, [query, category, location, dateFrom, dateTo])

  const filtered = useMemo(() => {
    const base = items ?? placeholderItems
    return base.filter((item) => {
      const matchesQuery = query.trim()
        ? (item.title || '').toLowerCase().includes(query.trim().toLowerCase())
        : true
      const matchesCategory = category !== 'all' ? item.category === category : true
      const matchesLocation = location !== 'all' ? item.location === location : true
      const dateValue = item.date || item.created_at
      const matchesDateFrom = dateFrom ? new Date(dateValue) >= new Date(dateFrom) : true
      const matchesDateTo = dateTo ? new Date(dateValue) <= new Date(dateTo) : true
      return matchesQuery && matchesCategory && matchesLocation && matchesDateFrom && matchesDateTo
    })
  }, [items, placeholderItems, query, category, location, dateFrom, dateTo])

  // Show loading screen until client-side authentication check is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SearchIcon className="h-6 w-6 text-accent" />
            <span className="font-semibold">SmartFind</span>
          </div>
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Filters</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="id-card">ID Card</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="keys">Keys</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={location} onValueChange={(v) => setLocation(v as Location)}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="stop">Bus Stop</SelectItem>
                      <SelectItem value="canteen">Canteen</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date from</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date to</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCategory('')
                      setLocation('')
                      setDateFrom('')
                      setDateTo('')
                      setQuery('')
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="md:col-span-3 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search items (e.g., iPhone, wallet)"
                  className="pl-10"
                />
              </div>
              <Button>
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            {loading && <div className="text-sm text-muted-foreground">Loading items…</div>}
            {error && <div className="text-sm text-destructive">{error}</div>}
            {filtered.length === 0 && !loading ? (
              <div className="text-sm text-muted-foreground">No items found. Try adjusting filters.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item) => (
                  <Card key={item.id} className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base">{item.title || item.name || 'Item'}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <div>Category: {item.category ?? '-'}</div>
                      <div>Location: {item.location ?? '-'}</div>
                      <div>Date: {(item.date || item.created_at || '').toString().slice(0, 10)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Controls */}
      <MobileControls />
    </div>
  )
}


