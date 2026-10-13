const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
  /\/+$/,
  ''
);

export const backendApiUrl = API_BASE_URL;
