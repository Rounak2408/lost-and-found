'use client'

import { Award, Trophy, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const leaderboard = [
  { user: 'Aarav', points: 320 },
  { user: 'Neha', points: 280 },
  { user: 'Riya', points: 210 },
]

const badges = [
  { name: 'First Match', desc: 'Completed your first successful match', icon: Award },
  { name: 'Helper', desc: 'Helped 5 users this month', icon: Trophy },
]

export default function GamificationPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-6 w-6 text-accent"/> Gamification</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Missions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><Target className="h-4 w-4"/> This week help 2 lost items</span>
                <span>1 / 2</span>
              </div>
              <Progress value={50} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2"><Target className="h-4 w-4"/> Upload 3 clear photos</span>
                <span>3 / 3</span>
              </div>
              <Progress value={100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {badges.map((b, i) => (
              <div key={i} className="p-3 border rounded flex items-start gap-3">
                <b.icon className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-sm text-muted-foreground">{b.desc}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.user}</TableCell>
                  <TableCell className="text-right">{row.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


