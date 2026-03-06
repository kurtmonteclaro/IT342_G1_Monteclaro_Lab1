export function getErrorMessage(error, fallback) {
  const payload = error?.response?.data;

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload?.message) {
    return payload.message;
  }

  return fallback;
}
