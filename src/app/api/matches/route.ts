// src/app/api/matches/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    try {
        let whereClause = '';
        if (stage && stage !== 'All') {
            whereClause = `WHERE f.stage = '${stage.replace(/'/g, "''")}'`;
        }

        // Optimized SQL: Prioritize LIVE, then upcoming, then finished. Order by kickoff_time within groups.
        // COALESCE ensures scores never return NULL to the frontend
        const sql = `
      SELECT
        f.id,
        f.external_api_id,
        f.kickoff_time,
        f.status,
        COALESCE(f.score_home, 0) AS score_home,
        COALESCE(f.score_away, 0) AS score_away,
        f.league,
        COALESCE(f.stage, 'Group Stage') AS stage,
        f.group_letter,
        t1.name AS home_team_name,
        COALESCE(t1.logo_url, '') AS home_team_logo,
        t2.name AS away_team_name,
        COALESCE(t2.logo_url, '') AS away_team_logo
      FROM fixtures f
      JOIN teams t1 ON f.home_team_id = t1.id
      JOIN teams t2 ON f.away_team_id = t2.id
      ${whereClause}
      ORDER BY
        CASE
          WHEN f.status IN ('LIVE', 'IN_PLAY') THEN 1
          WHEN f.status IN ('TIMED', 'SCHEDULED') THEN 2
          WHEN f.status = 'FINISHED' THEN 3
          ELSE 4
        END,
        f.kickoff_time ASC
      LIMIT 100
    `;

        const matches = await query(sql);
        return NextResponse.json(Array.isArray(matches) ? matches : [], {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=29',
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json([], { status: 200 });
    }
}