// src/app/api/force-groups/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // Get all matches from the database
        const matches = await query(`SELECT id FROM fixtures ORDER BY kickoff_time ASC`);

        const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        let groupIndex = 0;

        // Assign 3 matches to each group (24 matches total for the demo)
        for (let i = 0; i < matches.length && groupIndex < groups.length; i++) {
            const matchId = matches[i].id;
            const groupLetter = groups[groupIndex];

            await query(`
        UPDATE fixtures 
        SET group_letter = '${groupLetter}', stage = 'Group Stage' 
        WHERE id = ${matchId}
      `);

            // Move to the next group after assigning 3 matches
            if ((i + 1) % 3 === 0) {
                groupIndex++;
            }
        }

        return NextResponse.json({ success: true, message: "Groups forced successfully!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}