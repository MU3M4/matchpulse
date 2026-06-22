// src/app/api/match/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Validate the ID
    if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
            { error: "Invalid match ID" },
            { status: 400 }
        );
    }

    try {
        // Fetch match details with team info
        const matchSql = `
      SELECT 
        f.id, f.external_api_id, f.status, f.score_home, f.score_away, 
        f.league, f.kickoff_time,
        t1.name AS home_team_name, t1.logo_url AS home_team_logo,
        t2.name AS away_team_name, t2.logo_url AS away_team_logo
      FROM fixtures f
      JOIN teams t1 ON f.home_team_id = t1.id
      JOIN teams t2 ON f.away_team_id = t2.id
      WHERE f.external_api_id = ${id}
    `;

        const matchData = await query(matchSql);

        // Check if match exists
        if (!matchData || matchData.length === 0) {
            return NextResponse.json(
                { error: "Match not found" },
                { status: 404 }
            );
        }

        // Fetch match events (timeline)
        const eventsSql = `
      SELECT minute, event_type, player_name, team_id
      FROM match_events
      WHERE fixture_id = (SELECT id FROM fixtures WHERE external_api_id = ${id})
      ORDER BY minute ASC
    `;

        const events = await query(eventsSql);

        // Return structured response
        const response = {
            match: matchData[0],
            events: events || []
        };

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=29'
            }
        });
    } catch (error) {
        console.error("Error fetching match details:", error);
        return NextResponse.json(
            { error: "Failed to fetch match details", details: String(error) },
            { status: 500 }
        );
    }
}