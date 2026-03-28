import cron from 'node-cron';
import { runLowEffortPenalty } from './lowEffortPenalty';
import { runWorldcoinLapseCheck } from './worldcoinLapseCheck';
import { runReferralCodeExpiry } from './referralCodeExpiry';
import { runFeedScoreRecalc } from './feedScoreRecalc';

export function startCronJobs() {
  // Low-effort post penalty — every hour
  cron.schedule('0 * * * *', async () => {
    try { await runLowEffortPenalty(); } catch (e) { console.error('Low-effort penalty job error:', e); }
  });

  // Worldcoin lapse check — daily at 3am
  cron.schedule('0 3 * * *', async () => {
    try { await runWorldcoinLapseCheck(); } catch (e) { console.error('Worldcoin lapse check error:', e); }
  });

  // Referral code monthly refresh — 1st of each month at midnight
  cron.schedule('0 0 1 * *', async () => {
    try { await runReferralCodeExpiry(); } catch (e) { console.error('Referral code expiry error:', e); }
  });

  // Feed score recalculation — every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try { await runFeedScoreRecalc(); } catch (e) { console.error('Feed score recalc error:', e); }
  });

  console.log('Cron jobs started');
}
