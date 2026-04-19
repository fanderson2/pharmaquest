export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromSupabaseError(error: any): AppError {
    // Network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return new AppError(
        'Unable to connect to the server. Please check your internet connection.',
        'NETWORK_ERROR',
        error
      );
    }

    if (error?.message?.includes('JWT expired')) {
      return new AppError(
        'Your session has expired. Please sign in again.',
        'AUTH_SESSION_EXPIRED',
        error
      );
    }

    if (error?.message?.includes('Invalid token')) {
      return new AppError(
        'Invalid authentication. Please sign in again.',
        'AUTH_INVALID_TOKEN',
        error
      );
    }

    return new AppError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      error
    );
  }
}