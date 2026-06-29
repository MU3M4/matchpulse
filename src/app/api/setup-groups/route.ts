// src/app/api/setup-groups/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // Add group_letter column
        await query(`
      ALTER TABLE fixtures 
      ADD COLUMN IF NOT EXISTS group_letter CHAR(1)
    `);

        // Group A: Ecuador, Netherlands, Senegal, Qatar
        await query(`
      UPDATE fixtures 
      SET group_letter = 'A', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('Ecuador', 'Netherlands', 'Senegal', 'Qatar'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('Ecuador', 'Netherlands', 'Senegal', 'Qatar'))
    `);

        // Group B: England, USA, Wales, Iran
        await query(`
      UPDATE fixtures 
      SET group_letter = 'B', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('England', 'USA', 'Wales', 'Iran'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('England', 'USA', 'Wales', 'Iran'))
    `);

        // Group C: Argentina, Mexico, Poland, Saudi Arabia
        await query(`
      UPDATE fixtures 
      SET group_letter = 'C', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('Argentina', 'Mexico', 'Poland', 'Saudi Arabia'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('Argentina', 'Mexico', 'Poland', 'Saudi Arabia'))
    `);

        // Group D: France, Australia, Denmark, Tunisia
        await query(`
      UPDATE fixtures 
      SET group_letter = 'D', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('France', 'Australia', 'Denmark', 'Tunisia'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('France', 'Australia', 'Denmark', 'Tunisia'))
    `);

        // Group E: Spain, Germany, Japan, Costa Rica
        await query(`
      UPDATE fixtures 
      SET group_letter = 'E', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('Spain', 'Germany', 'Japan', 'Costa Rica'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('Spain', 'Germany', 'Japan', 'Costa Rica'))
    `);

        // Group F: Belgium, Croatia, Morocco, Canada
        await query(`
      UPDATE fixtures 
      SET group_letter = 'F', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('Belgium', 'Croatia', 'Morocco', 'Canada'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('Belgium', 'Croatia', 'Morocco', 'Canada'))
    `);

        // Group G: Brazil, Serbia, Switzerland, Cameroon
        await query(`
      UPDATE fixtures 
      SET group_letter = 'G', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('Brazil', 'Serbia', 'Switzerland', 'Cameroon'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('Brazil', 'Serbia', 'Switzerland', 'Cameroon'))
    `);

        // Group H: Portugal, Uruguay, South Korea, Ghana
        await query(`
      UPDATE fixtures 
      SET group_letter = 'H', stage = 'Group Stage'
      WHERE home_team_id IN (SELECT id FROM teams WHERE name IN ('Portugal', 'Uruguay', 'South Korea', 'Ghana'))
      OR away_team_id IN (SELECT id FROM teams WHERE name IN ('Portugal', 'Uruguay', 'South Korea', 'Ghana'))
    `);

        // Update Round of 32 matches (after group stage)
        await query(`
      UPDATE fixtures 
      SET stage = 'Round of 32'
      WHERE kickoff_time >= '2026-06-25' 
      AND kickoff_time < '2026-06-29'
    `);

        return NextResponse.json({
            success: true,
            message: "Groups configured successfully!"
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}