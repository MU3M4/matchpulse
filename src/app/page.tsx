// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Activity, ChevronRight, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Types matching our database
type Match = {
  id: number
  external_api_id: number
  league: string
  status: string
  score_home: number | null
  score_away: number | null
  home_team_name: string
  home_team_logo: string
  away_team_name: string
  away_team_logo: string
  kickoff_time: string
}

export default function MatchPulseHome() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Function to fetch data
    const fetchMatches = () => {
      fetch('/api/matches')
        .then(res => res.json())
        .then(data => {
          setMatches(data || [])
          setLoading(false)
        })
        .catch(err => {
          console.error("Failed to fetch matches:", err)
          setLoading(false)
        })
    }

    // Fetch immediately on load
    fetchMatches()

    // Then fetch every 30 seconds to simulate "Live" updates
    const interval = setInterval(fetchMatches, 30000)

    // Cleanup the timer if the user leaves the page
    return () => clearInterval(interval)
  }, [])

  // Separate live and upcoming matches
  const liveMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'IN_PLAY')
  const upcomingMatches = matches.filter(m => m.status === 'TIMED' || m.status === 'SCHEDULED')

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#00FF66]" />
            <h1 className="text-xl font-bold">MatchPulse</h1>
          </div>
          <Badge variant="secondary" className="bg-zinc-800">
            <Crown className="w-3 h-3 mr-1 text-yellow-500" />
            Free
          </Badge>
        </header>

        {/* Live Now Section */}
        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Live Now</h2>
            </div>
            <div className="space-y-3">
              {liveMatches.map((match) => (
                <Link key={match.id} href={`/match/${match.external_api_id}`} className="block">
                  <MatchCard match={match} isLive />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Section */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Upcoming Today
          </h2>
          {upcomingMatches.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No upcoming matches</p>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <Link key={match.id} href={`/match/${match.external_api_id}`} className="block">
                  <MatchCard match={match} isLive={false} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// Match Card Component
function MatchCard({ match, isLive }: { match: Match; isLive: boolean }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors">
      {/* League Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500 font-medium">{match.league}</span>
        {isLive && (
          <span className="text-xs text-red-500 font-bold animate-pulse">LIVE</span>
        )}
      </div>

      {/* Teams & Score */}
      <div className="space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={match.home_team_logo}
              alt={match.home_team_name}
              className="w-8 h-8 object-contain"
            />
            <span className="font-medium">{match.home_team_name}</span>
          </div>
          <span className="text-2xl font-bold">
            {isLive ? match.score_home ?? 0 : '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={match.away_team_logo}
              alt={match.away_team_name}
              className="w-8 h-8 object-contain"
            />
            <span className="font-medium">{match.away_team_name}</span>
          </div>
          <span className="text-2xl font-bold">
            {isLive ? match.score_away ?? 0 : '-'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <span>{new Date(match.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )
}