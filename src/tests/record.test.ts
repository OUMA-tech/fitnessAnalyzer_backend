import request from 'supertest';
import app from '../src/app'; // 确保你的 app.ts 导出的是 Express app 对象
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import RecordModel from '../src/models/recordModel';

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

  await request(app)
  .post('/api/auth/register')
  .send(testUser);

  const loginResponse = await request(app)
      .post('/api/auth/login') 
      .send({ email: 'testuser@example.com', password: 'Test1234!' });

  token = loginResponse.body.token;
  userId = loginResponse.body.user.userId;
  console.log(userId);
  await RecordModel.create({
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
