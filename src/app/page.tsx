// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Activity, ChevronRight, Crown, Trophy, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import GroupsView from "@/components/GroupsView"

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

export default function MatchPulseHome() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string>("All")

  useEffect(() => {
    const fetchMatches = () => {
      fetch('/api/matches')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMatches(data)
          } else {
            setMatches([])
          }
          setLoading(false)
        })
        .catch(err => {
          console.error("Failed to fetch matches:", err)
          setMatches([])
          setLoading(false)
        })
    }

    fetchMatches()
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  const liveMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'IN_PLAY')

  // For the main list, show FINISHED and TIMED matches
  const listMatches = matches.filter(m =>
    m.status === 'FINISHED' || m.status === 'TIMED' || m.status === 'SCHEDULED'
  )

  const filteredList = selectedStage === "All"
    ? listMatches
    : listMatches.filter(m => m.stage === selectedStage)

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
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
            <Crown className="w-3 h-3 mr-1 text-yellow-500" />
            Pro
          </Badge>
        </header>

        {/* Stage Filter Chips */}
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
        </div>

        {/* Live Now Section */}
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

        {/* Main List / Groups Section */}
        <section className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              {selectedStage === "All" ? "Tournament Matches" : selectedStage}
            </h2>
          </div>

          {/* If Group Stage is selected, show the organized Groups */}
          {selectedStage === "Group Stage" ? (
            <GroupsView matches={matches} />
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
              <p className="text-zinc-500 text-sm">No matches scheduled for this stage yet.</p>
            </div>
          ) : (
            // Show standard cards for Round of 32, 16, etc.
            filteredList.map((match) => (
              <Link key={match.id} href={`/match/${match.external_api_id}`} className="block">
                <MatchCard match={match} />
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  )
}

// Universal Match Card Component
function MatchCard({ match }: { match: Match }) {
  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY';
  const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED';

  // Format the time nicely (e.g., "Today, 16:00" or "Jun 29, 20:00")
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Today, ${time}` : date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${time}`;
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors">
      {/* Header */}
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

      {/* Teams & Score/Time */}
      <div className="space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={match.home_team_logo} alt={match.home_team_name} className="w-8 h-8 object-contain" />
            <span className="font-medium text-sm text-zinc-100">{match.home_team_name}</span>
          </div>
          <span className="text-xl font-bold font-mono text-white">
            {(isLive || isFinished) ? match.score_home ?? 0 : ''}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={match.away_team_logo} alt={match.away_team_name} className="w-8 h-8 object-contain" />
            <span className="font-medium text-sm text-zinc-100">{match.away_team_name}</span>
          </div>
          <span className="text-xl font-bold font-mono text-white">
            {(isLive || isFinished) ? match.score_away ?? 0 : ''}
          </span>
        </div>
      </div>

      {/* Footer: Shows Time for Upcoming, or Chevron for others */}
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