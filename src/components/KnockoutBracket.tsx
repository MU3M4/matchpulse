// src/components/KnockoutBracket.tsx
import Link from "next/link"
import { Trophy, Clock, CheckCircle2, ArrowRight } from "lucide-react"

type Match = {
    id: number
    external_api_id: number
    home_team_name: string
    away_team_name: string
    home_team_logo: string
    away_team_logo: string
    score_home: number | null
    score_away: number | null
    status: string
    kickoff_time: string
    stage: string
}

// Helper to group matches into pairs for bracket visualization
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

export default function KnockoutBracket({ matches, stage }: { matches: Match[]; stage: string }) {
    // Sort: Live > Upcoming > Finished, then by kickoff time
    const sorted = [...matches].sort((a, b) => {
        const statusOrder: Record<string, number> = { LIVE: 0, IN_PLAY: 0, TIMED: 1, SCHEDULED: 1, FINISHED: 2 }
        const aOrder = statusOrder[a.status] ?? 3
        const bOrder = statusOrder[b.status] ?? 3
        if (aOrder !== bOrder) return aOrder - bOrder
        return new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime()
    })

    const pairs = chunkArray(sorted, 2)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#00FF66]" />
                    <h2 className="text-lg font-bold text-white">{stage}</h2>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                    {matches.length} Matches
                </span>
            </div>

            {pairs.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                    <p className="text-zinc-500 text-sm">No matches scheduled for {stage} yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pairs.map((pair, idx) => (
                        <div key={idx} className="relative">
                            {/* Vertical connector line between bracket pairs */}
                            {idx < pairs.length - 1 && (
                                <div className="absolute left-1/2 -bottom-4 w-px h-4 bg-zinc-800" />
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                {pair.map((match) => (
                                    <BracketMatchCard key={match.id} match={match} />
                                ))}
                            </div>
                            {/* Qualified/Advancing indicator */}
                            {pair.length === 2 && pair.every(m => m.status === 'FINISHED') && (
                                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-[#00FF66]">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Winners advance to next round</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function BracketMatchCard({ match }: { match: Match }) {
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

    // Determine winner for visual highlighting
    const homeWon = isFinished && match.score_home !== null && match.score_away !== null && match.score_home > match.score_away
    const awayWon = isFinished && match.score_home !== null && match.score_away !== null && match.score_away > match.score_home

    return (
        <Link href={`/match/${match.external_api_id}`} className="block group">
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 group-hover:border-[#00FF66]/50 transition-all">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                    {isLive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> LIVE
                        </span>
                    )}
                    {isFinished && (
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">FT</span>
                    )}
                    {isUpcoming && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {formatTime(match.kickoff_time)}
                        </span>
                    )}
                </div>

                {/* Teams & Scores */}
                <div className="space-y-3">
                    <div className={`flex items-center justify-between ${homeWon ? 'bg-[#00FF66]/5 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                        <div className="flex items-center gap-3">
                            <img src={match.home_team_logo} alt="" className="w-8 h-8 object-contain" />
                            <span className={`text-sm font-medium ${homeWon ? 'text-[#00FF66] font-bold' : 'text-zinc-100'}`}>
                                {match.home_team_name}
                            </span>
                        </div>
                        <span className={`text-xl font-bold font-mono ${(isFinished || isLive) ? (homeWon ? 'text-[#00FF66]' : 'text-white') : 'text-zinc-600'}`}>
                            {(isFinished || isLive) ? match.score_home ?? 0 : '-'}
                        </span>
                    </div>

                    <div className={`flex items-center justify-between ${awayWon ? 'bg-[#00FF66]/5 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                        <div className="flex items-center gap-3">
                            <img src={match.away_team_logo} alt="" className="w-8 h-8 object-contain" />
                            <span className={`text-sm font-medium ${awayWon ? 'text-[#00FF66] font-bold' : 'text-zinc-100'}`}>
                                {match.away_team_name}
                            </span>
                        </div>
                        <span className={`text-xl font-bold font-mono ${(isFinished || isLive) ? (awayWon ? 'text-[#00FF66]' : 'text-white') : 'text-zinc-600'}`}>
                            {(isFinished || isLive) ? match.score_away ?? 0 : '-'}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> View Details
                    </span>
                    {isFinished && <span className="text-[10px] text-[#00FF66] font-bold">PRO</span>}
                </div>
            </div>
        </Link>
    )
}