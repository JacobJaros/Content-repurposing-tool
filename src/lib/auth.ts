import { prisma } from "@/lib/db/prisma";

const DEV_USER_EMAIL = "test@contentforge.dev";

export async function getDevUser() {
  const user = await prisma.user.findUnique({
    where: { email: DEV_USER_EMAIL },
  });
  return user;
}

export async function getCurrentUser() {
  // When DEV_BYPASS_AUTH is enabled, return the test user
  if (process.env.DEV_BYPASS_AUTH === "true") {
    return getDevUser();
  }

  // Real auth will use NextAuth getServerSession here
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.NEXTAUTH_SECRET) {
    console.warn("[Auth] Auth providers not configured");
    return null;
  }

  // TODO: implement real NextAuth session lookup
  return null;
}
