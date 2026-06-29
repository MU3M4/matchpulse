// src/app/api/sync-june29/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // Get the first 5 matches from the database to use for today's demo
        const matches = await query(`SELECT id FROM fixtures ORDER BY id ASC LIMIT 5`);

        if (!Array.isArray(matches) || matches.length < 5) {
            return NextResponse.json({ error: "Not enough matches in DB" }, { status: 400 });
        }

        // 1. Morning Games (FINISHED) - e.g., 10:00 AM and 1:00 PM
        // Let's make the first match a "South Africa" loss as you mentioned!
        await query(`
      UPDATE fixtures 
      SET stage = 'Round of 32', 
          status = 'FINISHED', 
          score_home = 2, 
          score_away = 1, 
          kickoff_time = '2026-06-29T10:00:00Z',
          last_updated = CURRENT_TIMESTAMP
      WHERE id = ${matches[0].id}
    `);

        await query(`
      UPDATE fixtures 
      SET stage = 'Round of 32', 
          status = 'FINISHED', 
          score_home = 3, 
          score_away = 0, 
          kickoff_time = '2026-06-29T13:00:00Z',
          last_updated = CURRENT_TIMESTAMP
      WHERE id = ${matches[1].id}
    `);

        // 2. Afternoon Game (LIVE) - e.g., 4:00 PM (Currently playing)
        await query(`
      UPDATE fixtures 
      SET stage = 'Round of 32', 
          status = 'LIVE', 
          score_home = 1, 
          score_away = 1, 
          kickoff_time = '2026-06-29T16:00:00Z',
          last_updated = CURRENT_TIMESTAMP
      WHERE id = ${matches[2].id}
    `);

        // 3. Evening Games (TIMED/Upcoming) - e.g., 7:00 PM and 10:00 PM
        await query(`
      UPDATE fixtures 
      SET stage = 'Round of 32', 
          status = 'TIMED', 
          score_home = NULL, 
          score_away = NULL, 
          kickoff_time = '2026-06-29T19:00:00Z',
          last_updated = CURRENT_TIMESTAMP
      WHERE id = ${matches[3].id}
    `);

        await query(`
      UPDATE fixtures 
      SET stage = 'Round of 32', 
          status = 'TIMED', 
          score_home = NULL, 
          score_away = NULL, 
          kickoff_time = '2026-06-29T22:00:00Z',
          last_updated = CURRENT_TIMESTAMP
      WHERE id = ${matches[4].id}
    `);

        return NextResponse.json({
            success: true,
            message: "Database updated to June 29th! 2 Finished, 1 Live, 2 Upcoming."
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}