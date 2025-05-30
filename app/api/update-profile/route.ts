
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { did, metadata } = body

    // Validate input
    if (!did) {
      return NextResponse.json({ error: 'Missing user DID' }, { status: 400 })
    }

    if (!metadata) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // Get credentials from environment variables
    // Note: For server-side API routes, we should use regular env vars, not NEXT_PUBLIC_
    const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID
    const PRIVY_APP_SECRET = process.env.NEXT_PUBLIC_PRIVY_APP_SECRET || process.env.PRIVY_APP_SECRET

    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
      console.error('Missing Privy credentials:', {
        hasAppId: !!PRIVY_APP_ID,
        hasAppSecret: !!PRIVY_APP_SECRET
      })
      return NextResponse.json({ error: 'Missing Privy credentials' }, { status: 500 })
    }

    console.log('Updating profile for DID:', did)
    console.log('Metadata keys:', Object.keys(metadata))

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
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      
      console.error('Privy API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      return NextResponse.json({ 
        error: 'Failed to update profile', 
        details: errorData,
        status: response.status 
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('Profile updated successfully:', result)
    return NextResponse.json({ success: true, data: result })
    
  } catch (error) {
    console.error('Server error in update-profile:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
