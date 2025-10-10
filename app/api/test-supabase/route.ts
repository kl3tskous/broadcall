import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing Supabase credentials',
      url: supabaseUrl ? 'URL exists' : 'URL missing',
      key: supabaseKey ? 'Key exists' : 'Key missing'
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data, error } = await supabase
      .from('calls')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        hint: error.hint,
        code: error.code
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection works!',
      url: supabaseUrl
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Unknown error',
      stack: err.stack
    })
  }
}
