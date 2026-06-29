import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const fixtures = await query(`SELECT id FROM fixtures ORDER BY id ASC LIMIT 8`);
        const baseDate = '2026-06-29';

        // Update first 4 as FINISHED morning matches
        await query(`UPDATE fixtures SET stage='Round of 32', status='FINISHED', score_home=2, score_away=1, kickoff_time='${baseDate}T10:00:00Z' WHERE id IN (${fixtures.slice(0, 2).map(f => f.id).join(',')})`);
        await query(`UPDATE fixtures SET stage='Round of 32', status='FINISHED', score_home=3, score_away=0, kickoff_time='${baseDate}T13:00:00Z' WHERE id IN (${fixtures.slice(2, 4).map(f => f.id).join(',')})`);

        // Update next 2 as LIVE afternoon matches
        await query(`UPDATE fixtures SET stage='Round of 32', status='LIVE', score_home=1, score_away=1, kickoff_time='${baseDate}T16:00:00Z' WHERE id IN (${fixtures.slice(4, 6).map(f => f.id).join(',')})`);

        // Update last 2 as TIMED evening matches
        await query(`UPDATE fixtures SET stage='Round of 32', status='TIMED', score_home=NULL, score_away=NULL, kickoff_time='${baseDate}T19:00:00Z' WHERE id IN (${fixtures.slice(6, 8).map(f => f.id).join(',')})`);

        return NextResponse.json({ success: true, message: "June 29 Knockout data seeded!" });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}