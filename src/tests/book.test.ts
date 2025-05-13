import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import BookModel from '../src/models/bookModel';

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

// beforeEach(async () => {
//   await BookModel.deleteMany(); // 每次测试清空表
// });

describe('Book API', () => {
  let bookId: string;

  // 创建一个书籍
  it('should create a book (mocked admin)', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', 'Bearer fake-token') // 模拟身份验证
      .send({
        title: '测试书籍',
        author: '作者甲',
        category: '技术',
        price: 88,
        stock: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('测试书籍');
    bookId = res.body._id; // 获取创建的书籍ID，用于后续修改和删除
    console.log(bookId);
  });

  // 修改已创建的书籍
  it('should update the book', async () => {
    const res = await request(app)
      .put(`/api/books/${bookId}`)
      .set('Authorization', 'Bearer fake-token') // 模拟身份验证
      .send({
        title: '更新后的书籍',
        author: '作者乙',
        category: '技术',
        price: 99,
        stock: 5,
      });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('更新后的书籍');
  });

  // 删除书籍
  it('should delete the book', async () => {
    const res = await request(app)
      .delete(`/api/books/${bookId}`)
      .set('Authorization', 'Bearer fake-token'); // 模拟身份验证

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Book deleted successfully');
  });

  it('should return a list of books', async () => {
    // 创建一些假数据
    await BookModel.create({
      title: 'Test Book 1',
      author: 'Author 1',
      category: 'Fiction',
      price: 100,
      stock: 5,
    });

    await BookModel.create({
      title: 'Test Book 2',
      author: 'Author 2',
      category: 'Non-fiction',
      price: 120,
      stock: 3,
    });

    const res = await request(app).get('/api/books').query({ page: 1, pageSize: 10 });

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(2);  // 确保返回了两个书籍
    expect(res.body.total).toBe(2);  // 确保总共两本书
    expect(res.body.page).toBe(1);  // 确保返回的是第一页
  });

  // 测试用例: 搜索图书
  it('should return books filtered by search', async () => {
    await BookModel.create({
      title: 'Searchable Book',
      author: 'Search Author',
      category: 'Fiction',
      price: 150,
      stock: 5,
    });

    const res = await request(app).get('/api/books').query({ search: 'Searchable', page: 1, pageSize: 10 });

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);  // 应该只返回一个书籍
    expect(res.body.books[0].title).toBe('Searchable Book');
  });

  // 测试用例: 根据分类过滤图书
  it('should return books filtered by category', async () => {
    await BookModel.create({
      title: 'Category Book',
      author: 'Category Author',
      category: 'Technology',
      price: 200,
      stock: 5,
    });

    const res = await request(app).get('/api/books').query({ category: 'Technology', page: 1, pageSize: 10 });

    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(1);  // 应该返回一个属于 Technology 类别的书籍
    expect(res.body.books[0].category).toBe('Technology');
  });
});
