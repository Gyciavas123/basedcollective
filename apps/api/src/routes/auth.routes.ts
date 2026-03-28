import { Router } from 'express';
import { authService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../utils/validation';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, applicationSchema } from '@basedcollective/shared';
import { prisma } from '../config/database';
import { referralService } from '../services/referral.service';
import { emailService } from '../services/email.service';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const user = await authService.register(req.body.email, req.body.password, req.body.displayName);
    res.status(201).json({ message: 'Registration successful. Your account is pending approval.', userId: user.id });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

authRoutes.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password, req.headers['user-agent'], req.ip);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

authRoutes.post('/google', authLimiter, async (req, res) => {
  try {
    const { googleId, email, displayName } = req.body;
    const result = await authService.googleAuth(googleId, email, displayName, req.headers['user-agent'], req.ip);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

authRoutes.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'If an account exists, a reset email has been sent.' });
  } catch {
    res.json({ message: 'If an account exists, a reset email has been sent.' });
  }
});

authRoutes.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ message: 'Password reset successful.' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

authRoutes.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization!.slice(7);
    await authService.logout(token);
    res.json({ message: 'Logged out successfully' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

authRoutes.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await authService.getSessions(req.user!.userId);
    res.json(sessions);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

authRoutes.delete('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    await authService.revokeSession(req.user!.userId, req.params.id as string);
    res.json({ message: 'Session revoked' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Applications
authRoutes.post('/applications', validate(applicationSchema), async (req, res) => {
  try {
    const { email, displayName, reasonForJoining, socialLinks, referralCode } = req.body;

    // Create user first
    const user = await authService.register(email, req.body.password || 'placeholder', displayName);

    let referralCodeRecord = null;
    if (referralCode) {
      const validation = await referralService.validateCode(referralCode);
      if (!validation.valid) {
        return res.status(400).json({ error: `Invalid referral code: ${validation.reason}` });
      }
      referralCodeRecord = await prisma.referralCode.findUnique({ where: { code: referralCode } });
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        email,
        displayName,
        reasonForJoining,
        socialLinks,
        referralCodeId: referralCodeRecord?.id,
      },
    });

    if (referralCode && referralCodeRecord) {
      await referralService.useCode(referralCode, user.id);
    }

    res.status(201).json({ message: 'Application submitted successfully', applicationId: application.id });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

authRoutes.post('/referral-codes/validate', async (req, res) => {
  try {
    const result = await referralService.validateCode(req.body.code);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
