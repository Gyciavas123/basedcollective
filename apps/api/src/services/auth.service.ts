import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { emailService } from './email.service';

export const authService = {
  async register(email: string, password: string, displayName: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + crypto.randomBytes(3).toString('hex');

    const user = await prisma.user.create({
      data: { email, passwordHash, displayName, slug, status: 'PENDING_APPROVAL' },
    });
    return user;
  },

  async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    if (user.status === 'BANNED') throw new Error('Account is banned');
    if (user.status === 'SUSPENDED' && user.suspendedUntil && user.suspendedUntil > new Date()) {
      throw new Error('Account is suspended');
    }
    if (user.status === 'PENDING_APPROVAL') throw new Error('Account pending approval');

    return this.createSession(user.id, user.role, userAgent, ipAddress);
  },

  async googleAuth(googleId: string, email: string, displayName: string, userAgent?: string, ipAddress?: string) {
    let user = await prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
      } else {
        const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + crypto.randomBytes(3).toString('hex');
        user = await prisma.user.create({
          data: { email, displayName, slug, googleId, status: 'PENDING_APPROVAL' },
        });
      }
    }

    if (user.status === 'BANNED') throw new Error('Account is banned');
    if (user.status === 'PENDING_APPROVAL') throw new Error('Account pending approval');

    return this.createSession(user.id, user.role, userAgent, ipAddress);
  },

  async createSession(userId: string, role: string, userAgent?: string, ipAddress?: string) {
    const token = jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY } as jwt.SignOptions);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: { userId, token, userAgent, ipAddress, expiresAt },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { token: session.token, user };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silent for security

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store reset token as a session with special prefix
    await prisma.session.create({
      data: {
        userId: user.id,
        token: `reset:${resetTokenHash}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await emailService.sendPasswordReset(email, user.displayName, resetToken);
  },

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await prisma.session.findUnique({ where: { token: `reset:${tokenHash}` } });
    if (!session || session.expiresAt < new Date()) throw new Error('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });
    await prisma.session.delete({ where: { id: session.id } });
  },

  async logout(token: string) {
    await prisma.session.deleteMany({ where: { token } });
  },

  async getSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, token: { not: { startsWith: 'reset:' } }, expiresAt: { gt: new Date() } },
      select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new Error('Session not found');
    await prisma.session.delete({ where: { id: sessionId } });
  },
};
