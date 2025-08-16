import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}