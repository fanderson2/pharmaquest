export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }

  static isServiceError(error: any): error is ServiceError {
    return error instanceof ServiceError;
  }

  static fromFirebaseError(error: any): ServiceError {
    if (error?.code === 'permission-denied') {
      return new ServiceError(
        'Please ensure you are signed in to access this feature.',
        'AUTH_REQUIRED',
        error
      );
    }

    if (error?.code === 'not-found') {
      return new ServiceError(
        'The requested resource was not found.',
        'NOT_FOUND',
        error
      );
    }

    return new ServiceError(
      'An unexpected error occurred. Please try again.',
      'UNKNOWN_ERROR',
      error
    );
  }
}