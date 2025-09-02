import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Health check endpoint for monitoring application status
 * Returns information about database connectivity and system health
 */
export async function GET() {
  try {
    const startTime = Date.now();
    const supabase = await createClient();
    
    // Check database connection
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    // If the health_check table doesn't exist, try a different table
    let dbStatus = 'connected';
    let dbError = null;
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, try profiles table instead
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profilesError) {
        dbStatus = 'error';
        dbError = profilesError.message;
      }
    } else if (error) {
      dbStatus = 'error';
      dbError = error.message;
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    return NextResponse.json({
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        error: dbError,
      },
      performance: {
        responseTime: `${responseTime}ms`,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        },
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    }, {
      status: dbStatus === 'connected' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
