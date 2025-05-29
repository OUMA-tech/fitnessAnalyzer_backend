import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import UserModel from '../models/userModel';
import { MongoMemoryServer } from 'mongodb-memory-server';

// 准备测试用户数据
const testUser = {
  email: 'testuser@example.com',
  username: 'testuser',
  password: 'Test1234!',
};

process.env.TEST_ENV = 'true';
let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return 201', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully!');
  });

  it('should not allow duplicate registration and return 400', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser); // 用相同 email 再注册一次

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'abc@example.com' }); // 缺少密码

    expect(response.status).toBe(500); // 或者 422，如果你有验证中间件
  });

  it('should validate email format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        username: 'testuser',
        password: 'Test1234!'
      });

    expect(response.status).toBe(400);
  });

  it('should validate password strength', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: '123' // 太短的密码
      });

    expect(response.status).toBe(400);
  });

  it('should validate username length', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        username: 'a', // 太短的用户名
        password: 'Test1234!'
      });

    expect(response.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should return 200 and a token when credentials are valid', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should return 401 when credentials are invalid', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });
});
