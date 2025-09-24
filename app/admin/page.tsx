'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

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
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Analytics</h1>

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


