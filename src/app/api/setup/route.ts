// src/app/api/setup/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    // We must split the SQL into an array because the Data API only supports ONE statement at a time!
    const sqlStatements = [
        `CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        external_api_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        league VARCHAR(50) NOT NULL,
        country VARCHAR(50),
        logo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS fixtures (
        id SERIAL PRIMARY KEY,
        external_api_id INTEGER UNIQUE NOT NULL,
        home_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        away_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        kickoff_time TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) NOT NULL,
        score_home INTEGER DEFAULT 0,
        score_away INTEGER DEFAULT 0,
        league VARCHAR(50) NOT NULL,
        last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS match_events (
        id SERIAL PRIMARY KEY,
        external_api_id INTEGER UNIQUE,
        fixture_id INTEGER REFERENCES fixtures(id) ON DELETE CASCADE,
        minute INTEGER NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        player_name VARCHAR(100),
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        extra_info JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`,
        `CREATE TABLE IF NOT EXISTS user_favorites (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, team_id)
    )`,
        `CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status)`,
        `CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff ON fixtures(kickoff_time DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_events_fixture ON match_events(fixture_id, minute ASC)`,
        `CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id)`
    ];

    try {
        // Execute each statement one by one
        for (const sql of sqlStatements) {
            await query(sql);
        }
        return NextResponse.json({ success: true, message: "🎉 Database schema created successfully via Data API!" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}