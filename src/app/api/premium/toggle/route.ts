// src/app/api/premium/toggle/route.ts
import { NextResponse } from 'next/server';

// Simple in-memory storage for demo
let isPremium = false;

export async function GET() {
    return NextResponse.json({ isPremium });
}

export async function POST() {
    isPremium = !isPremium;
    return NextResponse.json({
        isPremium,
        message: `Premium ${isPremium ? 'enabled' : 'disabled'}`
    });
}