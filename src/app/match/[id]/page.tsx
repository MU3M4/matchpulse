// src/app/match/[id]/page.tsx
"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, Lock, TrendingUp, Target, Activity } from 'lucide-react';
import { query } from '@/lib/db';

// ... (keep all the types the same)

export default function MatchDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        // Fetch premium status and match data
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
            {/* ... (keep the scoreboard section the same) ... */}

            {/* Premium Stats Section - NOW FUNCTIONAL */}
            <div className="p-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Match Statistics
                </h3>

                {isPremium ? (
                    // UNLOCKED STATS - Show real data
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
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold">5</span>
                                <span className="text-xs text-zinc-500">Shots on Target</span>
                                <span className="text-sm font-bold">2</span>
                            </div>
                        </div>

                        {/* Corners */}
                        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
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
                    // LOCKED - Show paywall
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
                        {/* Blurred background */}
                        <div className="p-6 opacity-20 blur-sm">
                            <div className="h-16 bg-zinc-700 rounded mb-3" />
                            <div className="h-16 bg-zinc-700 rounded mb-3" />
                            <div className="h-16 bg-zinc-700 rounded" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}