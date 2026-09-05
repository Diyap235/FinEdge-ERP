import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Resolve the authenticated user from the existing User table.
 *
 * This app has no JWT/session layer. Identity for the AI endpoint is the
 * seeded User row selected in the UI. Role is always loaded from PostgreSQL
 * and is never taken from the request body.
 */
export async function requireAuth(req, res, next) {
  try {
    const userIdRaw = req.header('x-user-id');

    if (!userIdRaw) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userId = parseInt(userIdRaw, 10);
    if (Number.isNaN(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid user identity',
      });
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });
    } catch (dbErr) {
      await prisma.$connect().catch(() => {});
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to authenticate user',
    });
  }
}

export default requireAuth;
