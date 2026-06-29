// src/app/api/premium/toggle/route.ts
import { NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
// In production, this would be in your database
let isPremium = false;

export async function GET() {
    return NextResponse.json({ isPremium });
}

export async function POST() {
    isPremium = !isPremium; // Toggle premium status
    return NextResponse.json({ isPremium, message: `Premium ${isPremium ? 'enabled' : 'disabled'}` });
}