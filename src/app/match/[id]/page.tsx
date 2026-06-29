// src/app/match/[id]/page.tsx
"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, Lock, TrendingUp, Target, Activity, Video, Upload } from 'lucide-react';

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

export default function MatchDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<MatchData | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { id } = await params;

            try {
                // Check premium status
                const premiumRes = await fetch('/api/premium/toggle');
                const premiumData = await premiumRes.json();
                setIsPremium(premiumData.isPremium);

                // Fetch match data
                const matchRes = await fetch(`/api/match/${id}`);
                if (!matchRes.ok) throw new Error('Match not found');

                const matchData = await matchRes.json();
                setMatch(matchData.match);
                setEvents(matchData.events || []);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params]);

    const togglePremium = async () => {
        const res = await fetch('/api/premium/toggle', { method: 'POST' });
        const data = await res.json();
        setIsPremium(data.isPremium);
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulate upload - in production, this would go to Vercel Blob or S3
            const fakeUrl = URL.createObjectURL(file);
            setVideoUrl(fakeUrl);
            setShowUploadModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Match not found</h2>
                    <Link href="/" className="text-[#00FF66]">Go Back Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
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
                        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-zinc-800" />

                        {events.map((event, index) => (
                            <div key={index} className="flex items-start relative z-10">
                                <div className="w-12 text-right pr-4 pt-1">
                                    <span className="text-sm font-bold text-zinc-300">{event.minute}'</span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 border-zinc-950 mt-1.5 ${event.event_type === 'Goal' ? 'bg-[#00FF66]' :
                                        event.event_type === 'Card' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`} />
                                <div className="ml-4 flex-1 pb-4 border-b border-zinc-800/50 last:border-0">
                                    <div className="font-medium text-white">{event.event_type}</div>
                                    <div className="text-sm text-zinc-400">{event.player_name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Premium Stats Section */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center">
                        <Activity className="w-4 h-4 mr-2" /> Match Statistics
                    </h3>

                    {isPremium ? (
                        <div className="space-y-4">
                            {/* Possession */}
                            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{match.home_team_name}</span>
                                    <span className="text-xs text-zinc-500">Possession</span>
                                    <span className="text-sm font-medium">{match.away_team_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-[#00FF66] rounded-full" style={{ width: '60%' }} />
                                    <span className="text-xs font-bold text-[#00FF66]">60%</span>
                                    <span className="text-xs text-zinc-500">40%</span>
                                    <div className="flex-1 h-2 bg-zinc-700 rounded-full" style={{ width: '40%' }} />
                                </div>
                            </div>

                            {/* Shots on Target */}
                            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold">5</span>
                                    <span className="text-xs text-zinc-500">Shots on Target</span>
                                    <span className="text-sm font-bold">2</span>
                                </div>
                            </div>

                            {/* Corners */}
                            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold">7</span>
                                    <span className="text-xs text-zinc-500">Corners</span>
                                    <span className="text-sm font-bold">3</span>
                                </div>
                            </div>

                            {/* Toggle Button */}
                            <button
                                onClick={togglePremium}
                                className="w-full mt-4 bg-zinc-800 text-zinc-400 font-medium py-3 rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                                Switch to Free Tier (Demo)
                            </button>
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
                            <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                                <Lock className="w-12 h-12 text-[#00FF66] mb-3" />
                                <h4 className="font-bold text-lg mb-2">Unlock Live Stats</h4>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Get possession, shots on target, corners, and xG data.
                                </p>
                                <button
                                    onClick={togglePremium}
                                    className="bg-[#00FF66] text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-[#00cc52] transition-colors"
                                >
                                    Upgrade to Premium - $2.99/mo
                                </button>
                                <p className="text-xs text-zinc-500 mt-3">Demo: Click to toggle premium access</p>
                            </div>
                            <div className="p-6 opacity-20 blur-sm">
                                <div className="h-16 bg-zinc-700 rounded mb-3" />
                                <div className="h-16 bg-zinc-700 rounded mb-3" />
                                <div className="h-16 bg-zinc-700 rounded" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Premium Video Highlights */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center">
                        <Video className="w-4 h-4 mr-2" /> Match Highlights
                    </h3>

                    {isPremium ? (
                        <div className="space-y-4">
                            {videoUrl ? (
                                // User-uploaded video
                                <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="w-full aspect-video"
                                    />
                                    <div className="p-4">
                                        <p className="text-sm text-zinc-400"> Your uploaded highlight video</p>
                                        <button
                                            onClick={() => setVideoUrl('')}
                                            className="mt-2 text-xs text-red-500 hover:text-red-400"
                                        >
                                            Remove Video
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Default YouTube embed placeholder
                                <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                                    <div className="aspect-video w-full bg-zinc-800 flex items-center justify-center">
                                        <div className="text-center">
                                            <Video className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                                            <p className="text-sm text-zinc-500">Sample Highlight Video</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-zinc-400 mb-3">
                                            🎥 Watch full match highlights and replay
                                        </p>
                                        <label className="inline-flex items-center gap-2 bg-[#00FF66] text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-[#00cc52] transition-colors cursor-pointer">
                                            <Upload className="w-4 h-4" />
                                            Upload Your Highlight
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={handleVideoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
                            <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                                <Lock className="w-12 h-12 text-[#00FF66] mb-3" />
                                <h4 className="font-bold text-lg mb-2">Unlock Video Highlights</h4>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Watch full match replays and upload your own highlights.
                                </p>
                                <button
                                    onClick={togglePremium}
                                    className="bg-[#00FF66] text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-[#00cc52] transition-colors"
                                >
                                    Upgrade to Premium
                                </button>
                            </div>
                            <div className="p-6 opacity-20 blur-sm">
                                <div className="aspect-video bg-zinc-700 rounded mb-3" />
                                <div className="h-4 bg-zinc-700 rounded w-3/4" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}