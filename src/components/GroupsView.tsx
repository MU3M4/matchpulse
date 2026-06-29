// src/components/GroupsView.tsx
"use client"

import { Trophy } from "lucide-react"

type Match = {
    id: number
    home_team_name: string
    away_team_name: string
    score_home: number | null
    score_away: number | null
    status: string
    group_letter: string | null
    kickoff_time: string
}

export default function GroupsView({ matches }: { matches: Match[] }) {
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    return (
        <div className="space-y-6">
            {groups.map(letter => {
                // Filter matches for this specific group
                const groupMatches = matches.filter(m => m.group_letter === letter)

                // Only show the group if there are matches in the database for it
                if (groupMatches.length === 0) return null

                return (
                    <div key={letter} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                        {/* Group Header */}
                        <div className="bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[#00FF66]" />
                            <h3 className="font-bold text-sm text-white">Group {letter}</h3>
                        </div>

                        {/* Matches in this group */}
                        <div className="p-4 space-y-4">
                            {groupMatches.map(match => (
                                <div key={match.id} className="flex items-center justify-between text-sm border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-zinc-200">{match.home_team_name}</span>
                                            {match.status === 'FINISHED' && (
                                                <span className="font-bold text-white">{match.score_home}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-zinc-200">{match.away_team_name}</span>
                                            {match.status === 'FINISHED' && (
                                                <span className="font-bold text-white">{match.score_away}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                        {match.status === 'FINISHED' ? (
                                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded">FT</span>
                                        ) : (
                                            <span className="text-[10px] text-zinc-500">
                                                {new Date(match.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}