import request from 'supertest';
import app from '../app'; // 确保你的 app.ts 导出的是 Express app 对象
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import RecordModel from '../models/recordModel';
import Record from '../models/recordModel';

process.env.TEST_ENV = 'true';
process.env.JWT_SECRET = 'jwt_secret';
let mongo: MongoMemoryServer;

let token: string;
let userId: string;

const testUser = {
  email: 'testuser@example.com',
  username: 'testuser',
  password: 'Test1234!',
};


beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  // Register user
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  console.log('Register Response:', registerResponse.body);
  
  if (registerResponse.status !== 201) {
    throw new Error(`Registration failed: ${JSON.stringify(registerResponse.body)}`);
  }

  // Login user
  const loginResponse = await request(app)
    .post('/api/auth/login') 
    .send({ email: testUser.email, password: testUser.password });

  console.log('Login Response:', loginResponse.body);

  if (loginResponse.status !== 200 || !loginResponse.body.user) {
    throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
  }

  token = loginResponse.body.token;
  userId = loginResponse.body.user.userId;
  
  // Create test record
  const record = await Record.create({
    userId,
    source: 'apple_watch',
    activity: 'morning run',
    distance: 5.0,
    duration: 1800,
    category: 'running',
    heartRateAvg: '135',
    elevationGain: 100,
    calories: 300,
  });

  console.log('Created test record:', record);
});


afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('GET /api/records', () => {
  it('should return 200 and a list of records', async () => {
    const response = await request(app)
    .get('/api/records')
    .set('Authorization', `Bearer ${token}`);
    // .query({ page: 1, pageSize: 10, category: 'running' });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.records || response.body)).toBe(true); // 取决于返回格式
  });
});
