import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/database/products';
import { squareService } from '@/lib/square-integration';

/**
 * GET /api/products/health - Health check endpoint
 * Tests database and Square API connectivity
 */
export async function GET(request: NextRequest) {
  try {
    const results = {
      database: { status: 'unknown', error: null as string | null },
      square: { status: 'unknown', error: null as string | null },
      overall: 'unknown' as 'healthy' | 'degraded' | 'unhealthy',
    };

    // Test database connection
    try {
      const dbTest = await productService.testConnection();
      results.database.status = dbTest.success ? 'healthy' : 'unhealthy';
      results.database.error = dbTest.error || null;
    } catch (error) {
      results.database.status = 'unhealthy';
      results.database.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test Square API connection
    try {
      const squareTest = await squareService.testConnection();
      results.square.status = squareTest.success ? 'healthy' : 'unhealthy';
      results.square.error = squareTest.error || null;
    } catch (error) {
      results.square.status = 'unhealthy';
      results.square.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Determine overall health
    if (results.database.status === 'healthy' && results.square.status === 'healthy') {
      results.overall = 'healthy';
    } else if (results.database.status === 'healthy') {
      results.overall = 'degraded'; // Database works but Square doesn't
    } else {
      results.overall = 'unhealthy'; // Database is critical
    }

    const statusCode = results.overall === 'healthy' ? 200 : 
                      results.overall === 'degraded' ? 200 : 503;

    return NextResponse.json({
      success: results.overall !== 'unhealthy',
      timestamp: new Date().toISOString(),
      services: results,
    }, { status: statusCode });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {
        database: { status: 'unknown', error: 'Health check failed' },
        square: { status: 'unknown', error: 'Health check failed' },
        overall: 'unhealthy',
      },
    }, { status: 503 });
  }
}
