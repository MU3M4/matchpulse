// src/app/api/seed-events/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // 1. Find the internal ID for the Belgium vs Iran match (external_api_id: 537365)
        const fixtureRes = await query(`SELECT id FROM fixtures WHERE external_api_id = 537365`);
        const fixtureId = fixtureRes[0]?.id;

        if (!fixtureId) {
            return NextResponse.json({ error: "Match not found" }, { status: 404 });
        }

        // 2. Insert some fake events
        const events = [
            { minute: 12, type: 'Goal', player: 'R. Lukaku', team: 1 }, // team_id doesn't strictly matter for this demo
            { minute: 34, type: 'Card', player: 'M. Jahanbakhsh', team: 2 },
            { minute: 45, type: 'Goal', player: 'K. De Bruyne', team: 1 },
            { minute: 67, type: 'Sub', player: 'L. Trossard', team: 1 },
        ];

        for (const event of events) {
            await query(`
        INSERT INTO match_events (fixture_id, minute, event_type, player_name, team_id) 
        VALUES (${fixtureId}, ${event.minute}, '${event.type}', '${event.player}', ${event.team})
      `);
        }

        return NextResponse.json({ success: true, message: "Events added!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}