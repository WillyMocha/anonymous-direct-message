export function isIgResponseErrorWithStatus(
  error: unknown,
  status: number
): error is { response: { statusCode: number } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as Record<string, unknown>).response === 'object' &&
    (error as { response: { statusCode?: number } }).response?.statusCode === status
  );
}

export function isIgResponseError(
  error: unknown
): error is { response?: { body?: unknown } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}
