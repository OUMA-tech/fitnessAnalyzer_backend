import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app';
import { generateToken } from '../../utils/auth';

describe('Training Plan Endpoints', () => {
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'trainplan@example.com',
        password: 'Password123!',
        name: 'Training Plan User'
      });

    userId = registerResponse.body.id;
    
    // Login to get the auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'trainplan@example.com',
        password: 'Password123!'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear training plans collection before each test
    await mongoose.connection.collection('trainingplans').deleteMany({});
  });

  describe('POST /api/trainPlans', () => {
    test('should create a new training plan', async () => {
      const planData = {
        title: 'Beginner Workout Plan',
        description: 'A simple workout plan for beginners',
        duration: 4,
        difficulty: 'beginner',
        exercises: [
          {
            name: 'Push-ups',
            sets: 3,
            reps: 10
          },
          {
            name: 'Squats',
            sets: 3,
            reps: 15
          }
        ]
      };

      const response = await request(app)
        .post('/api/trainPlans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(planData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(planData.title);
      expect(response.body.exercises).toHaveLength(2);
    });

    test('should reject unauthorized request', async () => {
      const response = await request(app)
        .post('/api/trainPlans')
        .send({
          title: 'Test Plan',
          description: 'Test Description'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/trainPlans', () => {
    beforeEach(async () => {
      // Add some test plans
      const plans = [
        {
          title: 'Plan 1',
          description: 'Description 1',
          userId,
          duration: 4,
          difficulty: 'beginner'
        },
        {
          title: 'Plan 2',
          description: 'Description 2',
          userId,
          duration: 8,
          difficulty: 'intermediate'
        }
      ];

      await mongoose.connection.collection('trainingplans').insertMany(plans);
    });

    test('should get all training plans for user', async () => {
      const response = await request(app)
        .get('/api/trainPlans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    test('should filter plans by difficulty', async () => {
      const response = await request(app)
        .get('/api/trainPlans?difficulty=beginner')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].difficulty).toBe('beginner');
    });
  });

  describe('PUT /api/trainPlans/:id', () => {
    let planId: string;

    beforeEach(async () => {
      // Create a test plan
      const result = await mongoose.connection.collection('trainingplans').insertOne({
        title: 'Original Plan',
        description: 'Original Description',
        userId,
        duration: 4,
        difficulty: 'beginner'
      });
      planId = result.insertedId.toString();
    });

    test('should update training plan', async () => {
      const updateData = {
        title: 'Updated Plan',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/trainPlans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
    });

    test('should reject update of non-existent plan', async () => {
      const response = await request(app)
        .put('/api/trainPlans/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/trainPlans/:id', () => {
    let planId: string;

    beforeEach(async () => {
      // Create a test plan
      const result = await mongoose.connection.collection('trainingplans').insertOne({
        title: 'Plan to Delete',
        description: 'This plan will be deleted',
        userId,
        duration: 4,
        difficulty: 'beginner'
      });
      planId = result.insertedId.toString();
    });

    test('should delete training plan', async () => {
      const response = await request(app)
        .delete(`/api/trainPlans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify plan is deleted
      const plan = await mongoose.connection.collection('trainingplans').findOne({ _id: new mongoose.Types.ObjectId(planId) });
      expect(plan).toBeNull();
    });

    test('should reject deletion of non-existent plan', async () => {
      const response = await request(app)
        .delete('/api/trainPlans/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 