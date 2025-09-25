'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { markFindAsReturned } from '@/lib/database/finds-losses'
import { sendCommunityNotification } from '@/lib/database/shared-notifications'

const data = [
  { name: 'Mon', matches: 12, reports: 40 },
  { name: 'Tue', matches: 18, reports: 35 },
  { name: 'Wed', matches: 15, reports: 38 },
  { name: 'Thu', matches: 22, reports: 41 },
  { name: 'Fri', matches: 28, reports: 55 },
  { name: 'Sat', matches: 33, reports: 60 },
  { name: 'Sun', matches: 25, reports: 50 },
]

export default function AdminAnalyticsPage() {
  const [markingId, setMarkingId] = useState('')
  const [isMarking, setIsMarking] = useState(false)
  const [markMessage, setMarkMessage] = useState<string | null>(null)
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mark Item as Returned</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1">
            <label className="text-sm block mb-1">Find ID</label>
            <Input
              placeholder="Enter find ID"
              value={markingId}
              onChange={(e) => setMarkingId(e.target.value)}
            />
          </div>
          <Button
            onClick={async () => {
              if (!markingId) return
              setIsMarking(true)
              setMarkMessage(null)
              try {
                const idNum = Number(markingId)
                if (Number.isNaN(idNum)) throw new Error('Invalid ID')
                const { data } = await markFindAsReturned(idNum)
                // Fire community notification for returned item
                await sendCommunityNotification({
                  type: 'find',
                  title: `✅ Item Returned: ${data?.item_name ?? 'Item'}`,
                  message: `"${data?.item_name ?? 'Item'}" has been returned to its owner. Great job, community!`,
                  item_name: data?.item_name ?? 'Item',
                  location: data?.location_found ?? 'Unknown',
                  date_occurred: new Date().toISOString().split('T')[0],
                })
                setMarkMessage('Marked as returned and notified community.')
                setMarkingId('')
              } catch (err: any) {
                setMarkMessage(err?.message || 'Failed to mark as returned')
              } finally {
                setIsMarking(false)
              }
            }}
            disabled={isMarking}
          >
            {isMarking ? 'Marking…' : 'Mark Returned'}
          </Button>
          {markMessage && (
            <div className="text-sm text-muted-foreground">{markMessage}</div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">25,430</div>
            <div className="text-sm text-muted-foreground">+3.2% vs last week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,284</div>
            <div className="text-sm text-muted-foreground">-1.1% vs last week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matches This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">153</div>
            <div className="text-sm text-muted-foreground">+12.4% vs last week</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ matches: { label: 'Matches', color: 'hsl(var(--chart-1))' }, reports: { label: 'Reports', color: 'hsl(var(--chart-2))' } }}
            className="h-72 w-full"
          >
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="reports" fill="var(--color-reports)" radius={4} />
              <Bar dataKey="matches" fill="var(--color-matches)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}


