/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class SquareAPIError extends Error {
  constructor(message: string, public statusCode?: number, public squareErrors?: any[]) {
    super(message);
    this.name = 'SquareAPIError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string | number) {
    super(`${resource}${id ? ` with ID ${id}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Error response formatter for API endpoints
 */
export function formatErrorResponse(error: Error): {
  success: false;
  error: string;
  details?: any;
} {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      details: error.field ? { field: error.field } : undefined,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (error instanceof SquareAPIError) {
    return {
      success: false,
      error: error.message,
      details: {
        statusCode: error.statusCode,
        squareErrors: error.squareErrors,
      },
    };
  }

  if (error instanceof DatabaseError) {
    return {
      success: false,
      error: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? error.originalError?.message : undefined,
    };
  }

  // Generic error
  return {
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  };
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };
}

/**
 * Rate limiting error
 */
export class RateLimitError extends Error {
  constructor(public retryAfter?: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}
