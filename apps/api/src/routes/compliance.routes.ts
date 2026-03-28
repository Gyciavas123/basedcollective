import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { complianceService } from '../services/compliance.service';

export const complianceRoutes = Router();

complianceRoutes.use(authMiddleware);

complianceRoutes.post('/export', async (req, res) => {
  try {
    const request = await complianceService.requestExport(req.user!.userId);
    res.status(201).json(request);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

complianceRoutes.post('/delete', async (req, res) => {
  try {
    const request = await complianceService.requestDeletion(req.user!.userId);
    res.status(201).json(request);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

complianceRoutes.get('/requests', async (req, res) => {
  try {
    const requests = await complianceService.getRequests(req.user!.userId);
    res.json(requests);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
