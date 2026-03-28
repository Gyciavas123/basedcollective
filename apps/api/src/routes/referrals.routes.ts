import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { referralService } from '../services/referral.service';

export const referralsRoutes = Router();

referralsRoutes.use(authMiddleware);

referralsRoutes.get('/codes', async (req, res) => {
  try {
    const codes = await referralService.getActiveCodes(req.user!.userId);
    res.json(codes);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

referralsRoutes.post('/codes/generate', async (req, res) => {
  try {
    const code = await referralService.generateCode(req.user!.userId);
    res.status(201).json(code);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
