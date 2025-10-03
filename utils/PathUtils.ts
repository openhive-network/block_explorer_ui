/**
 * Prepends the configured base path to a given path
 * Gets basePath from runtime environment to match Next.js configuration
 * @param path - The path to prepend the base path to  
 * @returns The path with base path prepended
 */
export function withBasePath(path: string): string {
  // Get basePath directly from window.__ENV instead of using env() function
  // This ensures we read from the __ENV.js file that we know is working
  const basePath = (typeof window !== 'undefined' && (window as any).__ENV) 
    ? (window as any).__ENV.REACT_APP_BASE_PATH || ''
    : '';
  
  // If no base path or path is already absolute URL, return as-is
  if (!basePath || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // Handle hash and query parameters
  if (path.startsWith('#') || path.startsWith('?')) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Combine base path with path, avoiding double slashes
  return `${basePath}${normalizedPath}`;
}

/**
 * Gets the current base path
 * @returns The configured base path or empty string
 */
export function getBasePath(): string {
  // In server/build time, get from process.env
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  
  // In browser, get from window.__ENV if available
  const basePath = (typeof window !== 'undefined' && (window as any).__ENV) 
    ? (window as any).__ENV.REACT_APP_BASE_PATH || ''
    : '';
  return basePath;
}

/**
 * Prepends base path to image src for Next.js Image component
 * @param src - The image source path
 * @returns The src with base path prepended if needed
 */
export function getImageSrc(src: string): string {
  // If already an external URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
    return src;
  }
  
  const basePath = getBasePath();
  
  // If no base path or src already includes it, return as-is
  if (!basePath || src.startsWith(basePath)) {
    return src;
  }
  
  // Prepend base path
  return `${basePath}${src.startsWith('/') ? src : '/' + src}`;
}