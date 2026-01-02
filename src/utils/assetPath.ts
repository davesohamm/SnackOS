/**
 * Utility function to get asset paths with correct base URL
 * This handles deployment to subdirectories (e.g., GitHub Pages)
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get base URL from Vite (defaults to '/' in dev, can be configured for production)
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Ensure base URL ends with a slash
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  // Return the full path
  return `${base}${cleanPath}`;
}

