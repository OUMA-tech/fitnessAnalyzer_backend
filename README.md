# FitnessAnalyze Backend

This is the backend service for the FitnessAnalyze application, a comprehensive fitness tracking and analysis platform.

## Features

- 🔐 User Authentication & Authorization
- 👤 User Profile Management
- 🏃‍♂️ Strava Integration
- 📋 Training Plans Management
- 📊 Workout Records Tracking
- 📚 API Documentation with Swagger

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Swagger/OpenAPI
- AWS S3 (for file storage)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- AWS Account (for S3 storage)
- Strava API credentials

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration

5. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000 by default.

## API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:3000/api-docs
```

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Environment Variables

See `.env.example` for all required environment variables.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middlewares/    # Custom middlewares
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── app.ts         # Express app setup
│   └── index.ts       # Entry point
├── tests/             # Test files
├── swagger.yaml       # API documentation
└── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Profile
- GET `/api/profile` - Get user profile
- PUT `/api/profile` - Update user profile

### Strava Integration
- GET `/api/strava/connect` - Connect Strava account
- GET `/api/strava/callback` - Strava OAuth callback

### Training Plans
- GET `/api/trainPlans` - Get all training plans
- POST `/api/trainPlans` - Create new training plan

### Records
- GET `/api/records` - Get workout records
- POST `/api/records` - Create new workout record

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE"
  }
}
```

## Security

- All sensitive data is encrypted
- JWT used for authentication
- CORS configured for security
- Rate limiting implemented
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
