// src/app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

// FIX: New helper that properly handles SQL NULLs (no quotes around NULL)
const sqlStr = (str: any) => {
    if (str === null || str === undefined) return 'NULL';
    return `'${String(str).replace(/'/g, "''")}'`;
};

// Helper to get the internal database ID for a team
async function getTeamInternalId(externalId: number, name: string, league: string, logo: string) {
    // 1. Insert the team if it doesn't exist
    await query(`
        INSERT INTO teams (external_api_id, name, league, logo_url) 
        VALUES (${externalId}, ${sqlStr(name)}, ${sqlStr(league)}, ${sqlStr(logo)}) 
        ON CONFLICT (external_api_id) DO NOTHING
    `);

    // 2. Fetch the internal ID we just created (or that already existed)
    const result = await query(`SELECT id FROM teams WHERE external_api_id = ${externalId}`);

    // The Data API returns an array of rows. We want the first row's 'id' column.
    return result[0]?.id;
}

export async function GET() {
    const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

    if (!API_KEY) {
        return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    try {
        // 1. Fetch today's matches from the external API
        const response = await fetch('https://api.football-data.org/v4/matches', {
            headers: { 'X-Auth-Token': API_KEY },
        });

        if (!response.ok) throw new Error('Failed to fetch from sports API');

        const data = await response.json();
        const matches = data.matches || [];

        // 2. Save them to Aurora
        for (const match of matches) {
            // FIX: Use optional chaining (?.) to prevent crashes if API returns empty objects
            const homeTeam = match.homeTeam || {};
            const awayTeam = match.awayTeam || {};
            const competition = match.competition || {};

            // Get the internal database IDs for both teams
            const homeTeamDbId = await getTeamInternalId(homeTeam.id, homeTeam.name, competition.name, homeTeam.crest);
            const awayTeamDbId = await getTeamInternalId(awayTeam.id, awayTeam.name, competition.name, awayTeam.crest);

            // If we couldn't get the IDs for some reason, skip this match to prevent crashes
            if (!homeTeamDbId || !awayTeamDbId) continue;

            // FIX: Safely handle null scores from the API (e.g., if the match hasn't started yet)
            const homeScore = match.score?.fullTime?.home ?? 'NULL';
            const awayScore = match.score?.fullTime?.away ?? 'NULL';

            // Save the Fixture using the INTERNAL database IDs
            const fixtureSql = `
                INSERT INTO fixtures (external_api_id, home_team_id, away_team_id, kickoff_time, status, score_home, score_away, league) 
                VALUES (${match.id}, ${homeTeamDbId}, ${awayTeamDbId}, ${sqlStr(match.utcDate)}, ${sqlStr(match.status)}, ${homeScore}, ${awayScore}, ${sqlStr(competition.name)}) 
                ON CONFLICT (external_api_id) DO UPDATE SET 
                status = EXCLUDED.status, 
                score_home = EXCLUDED.score_home, 
                score_away = EXCLUDED.score_away, 
                last_updated = CURRENT_TIMESTAMP
            `;
            await query(fixtureSql);
        }

        return NextResponse.json({ success: true, matchesSynced: matches.length });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}