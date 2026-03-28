import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';

export interface AuthPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;

    // Verify session is still valid
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Verify user is active
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status === 'BANNED') {
      return res.status(403).json({ error: 'Account is banned' });
    }
    if (user.status === 'SUSPENDED' && user.suspendedUntil && user.suspendedUntil > new Date()) {
      return res.status(403).json({ error: 'Account is suspended', suspendedUntil: user.suspendedUntil });
    }

    req.user = { userId: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
