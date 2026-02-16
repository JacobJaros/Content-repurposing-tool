import { prisma } from "@/lib/db/prisma";
import { refreshAccessToken } from "./auth";

/**
 * Get a valid (non-expired) access token for the given user.
 * If the current token is expired, refreshes it and updates the database.
 * TODO: Implement once exchangeCode/refreshAccessToken are working
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const connection = await prisma.youTubeConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    throw new Error("No YouTube connection found for this user");
  }

  // Check if token is still valid (with 5-minute buffer)
  const bufferMs = 5 * 60 * 1000;
  if (connection.tokenExpiry.getTime() > Date.now() + bufferMs) {
    return connection.accessToken;
  }

  // Token expired — refresh it
  const { accessToken, expiresIn } = await refreshAccessToken(connection.refreshToken);

  await prisma.youTubeConnection.update({
    where: { userId },
    data: {
      accessToken,
      tokenExpiry: new Date(Date.now() + expiresIn * 1000),
    },
  });

  return accessToken;
}
