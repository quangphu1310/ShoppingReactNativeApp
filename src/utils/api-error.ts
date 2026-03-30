/**
 * Shared API error extraction utilities.
 * Consolidates duplicate getApiErrorMessage from auth-slice and product-slice.
 */

interface ApiErrorShape {
  error?: { message?: string } | string;
}

/**
 * Extract a human-readable error message from an API error response body.
 * Handles multiple response shapes: plain string, `{ error: string }`, `{ error: { message } }`.
 */
export const getApiErrorMessage = (errorData: unknown): string | null => {
  if (!errorData) {
    return null;
  }

  if (typeof errorData === 'string') {
    return errorData;
  }

  const typedError = errorData as ApiErrorShape;

  if (typeof typedError.error === 'string') {
    return typedError.error;
  }

  if (typedError.error && typeof typedError.error.message === 'string') {
    return typedError.error.message;
  }

  return null;
};
