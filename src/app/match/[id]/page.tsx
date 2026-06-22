// src/app/match/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react';

// Types for our data
type MatchData = {
    id: number;
    external_api_id: number;
    status: string;
    score_home: number | null;
    score_away: number | null;
    league: string;
    kickoff_time: string;
    home_team_name: string;
    home_team_logo: string;
    away_team_name: string;
    away_team_logo: string;
};

type Event = {
    minute: number;
    event_type: string;
    player_name: string;
    team_id: number;
};

export default async function MatchDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    let match: MatchData | null = null;
    let events: Event[] = [];
    let error: string | null = null;

    try {
        // Fetch data from our API route
        const res = await fetch(`http://localhost:3000/api/match/${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            const errorData = await res.json();
            error = errorData.error || "Failed to load match";

            if (res.status === 404) {
                return notFound();
            }
        } else {
            const data = await res.json();
            match = data.match;
            events = data.events || [];
        }
    } catch (err) {
        console.error("Error in match detail page:", err);
        error = "Failed to connect to server";
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-block bg-[#00FF66] text-black font-bold px-6 py-3 rounded-full hover:bg-[#00cc52] transition-colors"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        );
    }

    // If no match data (shouldn't happen due to 404 check above, but just in case)
    if (!match) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="max-w-md mx-auto">

                {/* Header with Back Button */}
                <header className="sticky top-0 bg-zinc-950/90 backdrop-blur-md p-4 border-b border-zinc-800 z-10">
                    <Link
                        href="/"
                        className="flex items-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Back to Matches</span>
                    </Link>
                </header>

                {/* Match Scoreboard */}
                <div className="p-6 text-center border-b border-zinc-800">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
                        {match.league}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        {/* Home Team */}
                        <div className="flex flex-col items-center w-1/3">
                            <img
                                src={match.home_team_logo}
                                alt={match.home_team_name}
                                className="w-16 h-16 object-contain mb-2"
                            />
                            <span className="text-sm font-bold text-center leading-tight">
                                {match.home_team_name}
                            </span>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center w-1/3">
                            <div className="text-5xl font-black tracking-tighter">
                                {match.score_home ?? 0} - {match.score_away ?? 0}
                            </div>
                            <div className="mt-2 px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold text-[#00FF66]">
                                {match.status}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center w-1/3">
                            <img
                                src={match.away_team_logo}
                                alt={match.away_team_name}
                                className="w-16 h-16 object-contain mb-2"
                            />
                            <span className="text-sm font-bold text-center leading-tight">
                                {match.away_team_name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Match Timeline */}
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center">
                        <Clock className="w-4 h-4 mr-2" /> Match Timeline
                    </h3>

                    {events.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                            No events recorded yet for this match.
                        </div>
                    ) : (
                        <div className="space-y-4 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-zinc-800" />

                            {events.map((event, index) => (
                                <div key={index} className="flex items-start relative z-10">
                                    {/* Minute Marker */}
                                    <div className="w-12 text-right pr-4 pt-1">
                                        <span className="text-sm font-bold text-zinc-300">
                                            {event.minute}'
                                        </span>
                                    </div>

                                    {/* Icon Dot */}
                                    <div className={`w-4 h-4 rounded-full border-2 border-zinc-950 mt-1.5 ${event.event_type === 'Goal' ? 'bg-[#00FF66]' :
                                            event.event_type === 'Card' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`} />

                                    {/* Event Details */}
                                    <div className="ml-4 flex-1 pb-4 border-b border-zinc-800/50 last:border-0">
                                        <div className="font-medium text-white">{event.event_type}</div>
                                        <div className="text-sm text-zinc-400">{event.player_name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Premium Stats Teaser */}
                    <div className="mt-8 relative rounded-xl overflow-hidden border border-zinc-800">
                        <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                            <div className="text-4xl mb-2">🔒</div>
                            <h4 className="font-bold text-lg mb-1">Unlock Live Stats</h4>
                            <p className="text-sm text-zinc-400 mb-4">
                                Get possession, shots on target, and xG data.
                            </p>
                            <button className="bg-[#00FF66] text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-[#00cc52] transition-colors">
                                Upgrade to Premium
                            </button>
                        </div>
                        {/* Blurred background content */}
                        <div className="p-6 opacity-20 blur-sm">
                            <div className="h-4 bg-zinc-700 rounded w-3/4 mb-4" />
                            <div className="h-4 bg-zinc-700 rounded w-1/2 mb-4" />
                            <div className="h-4 bg-zinc-700 rounded w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}