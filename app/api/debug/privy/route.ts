import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID
    const PRIVY_APP_SECRET = process.env.NEXT_PUBLIC_PRIVY_APP_SECRET || process.env.PRIVY_APP_SECRET

    const config = {
      hasAppId: !!PRIVY_APP_ID,
      hasAppSecret: !!PRIVY_APP_SECRET,
      appIdLength: PRIVY_APP_ID?.length || 0,
      appSecretLength: PRIVY_APP_SECRET?.length || 0,
      appIdPrefix: PRIVY_APP_ID?.substring(0, 8) + '...' || 'missing',
    }

    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Missing Privy credentials',
        config
      }, { status: 500 })
    }

    // Test basic connectivity to Privy API
    try {
      const testResponse = await fetch('https://auth.privy.io/api/v1/apps/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'privy-app-id': PRIVY_APP_ID,
          Authorization: 'Basic ' + Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString('base64'),
        },
      })

      const connectionTest = {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok
      }

      if (testResponse.ok) {
        const appData = await testResponse.json()
        return NextResponse.json({
          success: true,
          message: 'Privy credentials are valid',
          config,
          connectionTest,
          appData: {
            id: appData.id,
            name: appData.name,
            created_at: appData.created_at
          }
        })
      } else {
        const errorText = await testResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }

        return NextResponse.json({
          success: false,
          error: 'Privy API authentication failed',
          config,
          connectionTest,
          details: errorData
        }, { status: testResponse.status })
      }
    } catch (networkError) {
      return NextResponse.json({
        success: false,
        error: 'Network error connecting to Privy',
        config,
        details: networkError instanceof Error ? networkError.message : 'Unknown network error'
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error in Privy debug',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}