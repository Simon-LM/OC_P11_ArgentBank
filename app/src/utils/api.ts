/** @format */

const rawApiBaseUrl = (import.meta.env.VITE_API_URL || "/api").trim();

const normalizedApiBaseUrl = rawApiBaseUrl.endsWith("/")
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedApiBaseUrl}${normalizedPath}`;
};
