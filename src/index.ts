import dotenv from 'dotenv';
dotenv.config();

import { startServer } from './startServer';

(async () => {
  try {
    await startServer();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
