import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export API functions
export { getLogs } from './api/getLogs';
export { getLog } from './api/getLog';
export { createLog } from './api/createLog';
export { getStats } from './api/getStats';

// Export scheduled functions
export { dailyPublish } from './scheduled/dailyPublish';
