const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = DEFAULT_RETRY_COUNT,
  delay: number = DEFAULT_RETRY_DELAY
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        const skipRetry = [
          'AUTH_INVALID_CREDENTIALS',
          'AUTH_EMAIL_EXISTS',
          'AUTH_SESSION_EXPIRED',
          'AUTH_INVALID_TOKEN'
        ].some(code => error.message.includes(code));
        
        if (skipRetry) throw error;
      }
      
      // Last attempt - throw the error
      if (attempt === maxRetries) throw error;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}