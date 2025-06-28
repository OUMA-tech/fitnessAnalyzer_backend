import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { createApiContainer } from './container/api.container';

import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

export async function startServer() {
  const container = await createApiContainer();
  const app = await createApp(container);

  // Load Swagger
  const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}
