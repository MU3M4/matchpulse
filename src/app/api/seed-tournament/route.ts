// src/app/api/seed-tournament/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // 1. Get all current matches from the database
        const allMatches = await query(`SELECT id FROM fixtures ORDER BY kickoff_time ASC`);

        if (!Array.isArray(allMatches) || allMatches.length === 0) {
            return NextResponse.json({ error: "No matches found in database" }, { status: 400 });
        }

        // 2. Update the first 24 matches to be "FINISHED" Group Stage matches with realistic scores
        const groupStageMatches = allMatches.slice(0, 24);
        const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        for (let i = 0; i < groupStageMatches.length; i++) {
            const matchId = groupStageMatches[i].id;
            const groupLetter = groups[Math.floor(i / 3)]; // Assign 3 matches per group for the demo

            // Generate realistic scores (e.g., 2-1, 3-0, 1-1)
            const homeScore = Math.floor(Math.random() * 4);
            const awayScore = Math.floor(Math.random() * 3);

            await query(`
        UPDATE fixtures 
        SET status = 'FINISHED', 
            score_home = ${homeScore}, 
            score_away = ${awayScore}, 
            stage = 'Group Stage', 
            group_letter = '${groupLetter}',
            last_updated = CURRENT_TIMESTAMP
        WHERE id = ${matchId}
      `);
        }

        // 3. Update the next 16 matches to be the "Round of 32" (Upcoming)
        const round32Matches = allMatches.slice(24, 40);
        let baseTime = new Date();
        baseTime.setDate(baseTime.getDate() + 1); // Start tomorrow

        for (let i = 0; i < round32Matches.length; i++) {
            const matchId = round32Matches[i].id;

            // Set kickoff times every 4 hours for the demo
            const kickoff = new Date(baseTime.getTime() + i * 4 * 60 * 60 * 1000);
            const kickoffStr = kickoff.toISOString();

            await query(`
        UPDATE fixtures 
        SET status = 'TIMED', 
            score_home = NULL, 
            score_away = NULL, 
            stage = 'Round of 32', 
            group_letter = NULL,
            kickoff_time = '${kickoffStr}',
            last_updated = CURRENT_TIMESTAMP
        WHERE id = ${matchId}
      `);
        }

        return NextResponse.json({
            success: true,
            message: "Tournament seeded! 24 Group Stage matches finished, 16 Round of 32 matches scheduled."
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}