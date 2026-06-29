// src/app/api/add-stage-column/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // Add stage column to fixtures table
        await query(`
      ALTER TABLE fixtures 
      ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'Group Stage'
    `);

        // Update existing matches with stages based on their dates
        // You can customize these dates based on actual World Cup schedule
        await query(`
      UPDATE fixtures 
      SET stage = CASE
        WHEN kickoff_time < '2026-06-25' THEN 'Group Stage'
        WHEN kickoff_time < '2026-06-29' THEN 'Round of 32'
        WHEN kickoff_time < '2026-07-03' THEN 'Round of 16'
        WHEN kickoff_time < '2026-07-07' THEN 'Quarter Finals'
        WHEN kickoff_time < '2026-07-11' THEN 'Semi Finals'
        ELSE 'Final'
      END
      WHERE stage IS NULL OR stage = 'Group Stage'
    `);

        return NextResponse.json({
            success: true,
            message: "Stage column added successfully!"
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}