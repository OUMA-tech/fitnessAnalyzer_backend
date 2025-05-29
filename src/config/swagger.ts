import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { Express } from 'express';

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

export const setupSwagger = (app: Express) => {
  // Serve Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}; 