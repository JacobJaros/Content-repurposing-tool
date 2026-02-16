import { YOUTUBE_CONFIG } from "./config";

/**
 * Generate the YouTube OAuth consent URL.
 */
export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: YOUTUBE_CONFIG.clientId,
    redirect_uri: YOUTUBE_CONFIG.redirectUri,
    response_type: "code",
    scope: YOUTUBE_CONFIG.scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `${YOUTUBE_CONFIG.authUrl}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens.
 */
export async function exchangeCode(
  code: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
}> {
  const res = await fetch(YOUTUBE_CONFIG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: YOUTUBE_CONFIG.clientId,
      client_secret: YOUTUBE_CONFIG.clientSecret,
      redirect_uri: YOUTUBE_CONFIG.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await res.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

/**
 * Refresh an expired access token using the stored refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const res = await fetch(YOUTUBE_CONFIG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: YOUTUBE_CONFIG.clientId,
      client_secret: YOUTUBE_CONFIG.clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await res.json();

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Fetch the authenticated user's YouTube channel info.
 */
export async function getChannelInfo(
  accessToken: string
): Promise<{
  channelId: string;
  channelTitle: string;
}> {
  const url = `${YOUTUBE_CONFIG.channelInfoUrl}?part=snippet&mine=true`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch channel info: ${error}`);
  }

  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("No YouTube channel found for this account");
  }

  const channel = data.items[0];
  return {
    channelId: channel.id,
    channelTitle: channel.snippet.title,
  };
}

/**
 * Revoke a user's YouTube access token.
 */
export async function revokeAccess(token: string): Promise<void> {
  const res = await fetch(
    `${YOUTUBE_CONFIG.revokeUrl}?token=${encodeURIComponent(token)}`,
    { method: "POST" }
  );

  if (!res.ok) {
    // Revocation failure is non-critical — token may already be invalid
    console.error("Token revocation failed:", await res.text());
  }
}
