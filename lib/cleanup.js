import { killSleepingConnections } from './db.js';

// تنظيف الاتصالات كل 30 ثانية
let cleanupInterval = null;

export function startConnectionCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  cleanupInterval = setInterval(async () => {
    try {
      console.log('[CLEANUP] Running connection cleanup...');
      const killed = await killSleepingConnections();
      
      if (killed > 0) {
        console.log(`[CLEANUP] Cleaned up ${killed} sleeping connections`);
      }
    } catch (error) {
      console.error('[CLEANUP] Cleanup failed:', error.message);
    }
  }, 30000); // كل 30 ثانية
  
  console.log('[CLEANUP] Connection cleanup started');
}

export function stopConnectionCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[CLEANUP] Connection cleanup stopped');
  }
}

// تنظيف عند إغلاق العملية
process.on('SIGINT', () => {
  console.log('[CLEANUP] Received SIGINT, cleaning up...');
  stopConnectionCleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[CLEANUP] Received SIGTERM, cleaning up...');
  stopConnectionCleanup();
  process.exit(0);
});