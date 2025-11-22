/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates if a code follows the pattern [A-Za-z0-9]{6,8}
 */
export function isValidCode(code: string): boolean {
  const codeRegex = /^[A-Za-z0-9]{6,8}$/;
  return codeRegex.test(code);
}

/**
 * Generates a random code of length 6-8 characters
 */
export function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Truncates a URL to a maximum length with ellipsis
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

