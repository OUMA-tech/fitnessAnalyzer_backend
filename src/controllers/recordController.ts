// src/controllers/book.controller.ts
import { Request, Response } from 'express';
import Record from '../models/recordModel';



// GET /api/books?search=关键词&category=分类&page=1&pageSize=10
export const getRecords = async (req: Request, res: Response):Promise<void> => {
  try {
    const _id = (req as any).user?._id;
    if (!_id) {
      res.status(401).json({ message: 'unauthorized, please login' });
      return ;
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const category = req.query.category?.toString() || '';

    const filter: any = {
      userId: _id
    };

    if (category) {
      filter.category = category;
    }
    console.log(filter);
    const total = await Record.countDocuments(filter);
    const records = await Record.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      records,
      page,
      totalPages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'failed getting record', error });
  }
};