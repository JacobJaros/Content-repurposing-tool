export const YOUTUBE_CONFIG = {
  clientId: process.env.GOOGLE_YOUTUBE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_YOUTUBE_CLIENT_SECRET || "",
  redirectUri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/youtube/callback`,
  scopes: [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
  ],
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  revokeUrl: "https://oauth2.googleapis.com/revoke",
  channelInfoUrl: "https://www.googleapis.com/youtube/v3/channels",
};

export function isYouTubeConfigured(): boolean {
  return !!(YOUTUBE_CONFIG.clientId && YOUTUBE_CONFIG.clientSecret);
}
