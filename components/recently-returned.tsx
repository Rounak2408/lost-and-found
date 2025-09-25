'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRecentlyReturnedFinds, type Find } from '@/lib/database/finds-losses'
import { Calendar, MapPin, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/components/i18n-provider'

export default function RecentlyReturned() {
  const { t } = useI18n()
  const [items, setItems] = useState<Find[]>([] as any)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await getRecentlyReturnedFinds(6)
        if (!isCancelled) {
          setItems(data as any)
        }
      } catch (err: any) {
        if (!isCancelled) setError(err?.message || t('recentlyReturned.error'))
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    run()
    return () => {
      isCancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="text-center text-sm text-muted-foreground">{t('recentlyReturned.loading')}</div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-sm text-destructive">{error}</div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">{t('recentlyReturned.empty')}</div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: any) => (
        <Card key={item.id} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base truncate">{item.item_name || 'Item'}</CardTitle>
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="h-3 w-3" /> Recovered
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            {item.image_url ? (
              <img src={item.image_url} alt={item.item_name} className="w-full h-32 object-cover rounded-md border" />
            ) : null}
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{item.location_found || item.location || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{(item.updated_at || item.created_at || '').toString().slice(0, 10)}</span>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            {item.description || item.item_description || 'Returned to the rightful owner.'}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}


