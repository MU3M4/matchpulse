// src/app/api/matches/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter

    try {
        // Build the query dynamically
        let whereClause = '';
        if (status) {
            whereClause = `WHERE f.status = '${status}'`;
        }

        const sql = `
      SELECT 
        f.id, f.external_api_id, f.kickoff_time, f.status, f.score_home, f.score_away, f.league,
        t1.name AS home_team_name, t1.logo_url AS home_team_logo,
        t2.name AS away_team_name, t2.logo_url AS away_team_logo
      FROM fixtures f
      JOIN teams t1 ON f.home_team_id = t1.id
      JOIN teams t2 ON f.away_team_id = t2.id
      ${whereClause}
      ORDER BY f.kickoff_time ASC
      LIMIT 50
    `;

        const matches = await query(sql);

        return NextResponse.json(matches, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=59' }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
    }
}