import { killSleepingConnections } from './db.js';

let cleanupInterval = null;

export function startConnectionCleanup() {
  // فقط في بيئة الإنتاج
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  
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
  }, 60000); // كل دقيقة
  
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
process.on('SIGINT', stopConnectionCleanup);
process.on('SIGTERM', stopConnectionCleanup);