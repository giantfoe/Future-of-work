
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { did, metadata } = body

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const PRIVY_APP_SECRET = process.env.NEXT_PUBLIC_PRIVY_APP_SECRET

  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    return NextResponse.json({ error: 'Missing Privy credentials' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://auth.privy.io/api/v1/users/${did}/custom_metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': PRIVY_APP_ID,
        Authorization:
          'Basic ' + Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString('base64'),
      },
      body: JSON.stringify({ custom_metadata: metadata }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: error }, { status: 500 })
  }
}
