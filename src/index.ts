// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';


// console.log(process.env.TOKEN_SECRET_KEY);
// const startServer = async () => {
//   try {
//     await connectDB(); // Database Connection
//     await createRootAdmin(); // init root admin
//     // Start Server
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error('Failed to start server:', err);
//     process.exit(1);
//   }
// };

// startServer();
(async () => {
  const app = await createApp();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();