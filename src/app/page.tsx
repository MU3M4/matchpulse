// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Activity, ChevronRight, Crown, Trophy, Clock, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import GroupsView from "@/components/GroupsView"
import KnockoutBracket from "@/components/KnockoutBracket"

type Match = {
  id: number
  external_api_id: number
  league: string
  stage: string
  group_letter: string
  status: string
  score_home: number | null
  score_away: number | null
  home_team_name: string
  home_team_logo: string
  away_team_name: string
  away_team_logo: string
  kickoff_time: string
}

const STAGES = ["All", "Group Stage", "Round of 32", "Round of 16", "Quarter Finals", "Semi Finals", "Final"]
const KNOCKOUT_STAGES = STAGES.filter(s => s !== "All" && s !== "Group Stage")

export default function MatchPulseHome() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string>("All")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchMatches = async () => {
    setIsRefreshing(true)
    try {
      // Bypass Next.js fetch cache to get live DB state
      const res = await fetch('/api/matches', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data)) {
        setMatches(data)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  const liveMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'IN_PLAY')
  const listMatches = [...matches].sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())
  const filteredList = selectedStage === "All"
    ? listMatches
    : listMatches.filter(m => m.stage === selectedStage)

  const isKnockout = KNOCKOUT_STAGES.includes(selectedStage)

  if (loading) {
    return (
      <div className="bg-zinc-950 text-white p-4 space-y-4 min-h-screen">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="sticky top-0 bg-zinc-950/90 backdrop-blur-md p-4 border-b border-zinc-800 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#00FF66]" />
            <h1 className="text-xl font-bold">MatchPulse</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMatches}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50"
              aria-label="Refresh matches"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
              <Crown className="w-3 h-3 mr-1 text-yellow-500" /> Pro
            </Badge>
          </div>
        </header>

        {/* Filter Chips */}
        <div className="sticky top-[73px] bg-zinc-950/95 backdrop-blur-md z-10 border-b border-zinc-800 py-3 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedStage === stage
                    ? "bg-[#00FF66] text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
                  }`}
              >
                {stage}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-zinc-600 text-right">
            Auto-updates every 30s • Last: {lastUpdated || '...'}
          </div>
        </div>

        {/* Live Section */}
        {liveMatches.length > 0 && (
          <section className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Live Now</h2>
            </div>
            {liveMatches.map((match) => (
              <Link key={match.id} href={`/match/${match.external_api_id}`} className="block">
                <MatchCard match={match} />
              </Link>
            ))}
          </section>
        )}

        {/* Main Content */}
        <section className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                {selectedStage === "All" ? "Tournament Matches" : selectedStage}
              </h2>
            </div>
            <span className="text-xs text-zinc-600">{filteredList.length} matches</span>
          </div>

          {selectedStage === "Group Stage" ? (
            <GroupsView matches={matches} />
          ) : isKnockout ? (
            <KnockoutBracket matches={filteredList} stage={selectedStage} />
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
              <p className="text-zinc-500 text-sm">No matches found for this stage.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((match) => (
                <Link key={match.id} href={`/match/${match.external_api_id}`} className="block">
                  <MatchCard match={match} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// MatchCard Component (Guarantees score display for finished matches)
function MatchCard({ match }: { match: Match }) {
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY'
  const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED'

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return isToday ? `Today, ${time}` : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${time}`
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          {match.league} • {match.stage}
        </span>
        {isLive && (
          <span className="text-[10px] text-red-500 font-bold animate-pulse bg-red-500/10 px-2 py-0.5 rounded-full">LIVE</span>
        )}
        {isFinished && (
          <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800 px-2 py-0.5 rounded-full">FT</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={match.home_team_logo} alt="" className="w-8 h-8 object-contain" />
            <span className="font-medium text-sm text-zinc-100">{match.home_team_name}</span>
          </div>
          <span className="text-xl font-bold font-mono text-white">
            {/* FIX: Guarantees scores show for finished/live, defaults to 0 if null */}
            {(isLive || isFinished) ? (match.score_home ?? 0) : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={match.away_team_logo} alt="" className="w-8 h-8 object-contain" />
            <span className="font-medium text-sm text-zinc-100">{match.away_team_name}</span>
          </div>
          <span className="text-xl font-bold font-mono text-white">
            {(isLive || isFinished) ? (match.score_away ?? 0) : '-'}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        {isUpcoming ? (
          <div className="flex items-center gap-1 text-[#00FF66]">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{formatTime(match.kickoff_time)}</span>
          </div>
        ) : (
          <span>{new Date(match.kickoff_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        )}
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )
}