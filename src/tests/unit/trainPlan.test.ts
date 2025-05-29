import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { insertTrainPlan, fetchDurationPlan } from '../../controllers/trainPlanController';
import TrainPlan, { TrainPlanModel } from '../../models/trainPlanModel';
import SubTask from '../../models/subTaskModel';
import mongoose, { Document, Types } from 'mongoose';

// Mock dependencies
jest.mock('../../models/trainPlanModel', () => ({
  insertMany: jest.fn(),
  aggregate: jest.fn()
}));
jest.mock('../../models/subTaskModel', () => ({
  insertMany: jest.fn()
}));
jest.mock('mongoose');

// Define mock types that match Mongoose document structure
interface MockTrainPlanDocument extends Document, TrainPlanModel {
  _id: Types.ObjectId;
  __v: number;
}

interface MockSubTaskDocument extends Document {
  _id: Types.ObjectId;
  trainPlanId: string;
  content: string;
  completed: boolean;
  __v: number;
}

// Create mock model constructors
const MockTrainPlanModel = TrainPlan as jest.Mocked<typeof TrainPlan>;
const MockSubTaskModel = SubTask as jest.Mocked<typeof SubTask>;

describe('Train Plan Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: Record<string, any>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    responseObject = {};

    // Setup response mock
    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
      json: jest.fn((data: Record<string, any>) => {
        responseObject = data;
        return mockResponse as Response;
      }) as jest.MockedFunction<Response['json']>,
    };
  });

  describe('insertTrainPlan', () => {
    const mockUser = { id: 'mockUserId' };
    const mockDate = new Date('2024-03-20');
    
    beforeEach(() => {
      mockRequest = {
        user: mockUser,
        body: {
          tasks: [
            {
              id: 1,
              title: '🏃‍♀️ Run',
              status: 'planned',
              date: mockDate,
              subTasks: [
                {
                  id: 1,
                  content: '5km easy run',
                  completed: false
                },
                {
                  id: 2,
                  content: 'Stretching after run',
                  completed: false
                }
              ]
            },
            {
              id: 2,
              title: '🏋️‍♂️ Weight Training',
              status: 'draft',
              date: mockDate,
              subTasks: [
                {
                  id: 3,
                  content: '3x10 Squats',
                  completed: false
                }
              ]
            }
          ]
        }
      };
    });

    test('should insert train plans and subtasks successfully', async () => {
      // Mock TrainPlan.insertMany to return plans with ObjectIds
      const mockPlanIds = {
        run: new Types.ObjectId('507f1f77bcf86cd799439011'),
        weightTraining: new Types.ObjectId('507f1f77bcf86cd799439012')
      };

      const mockInsertedPlans = [
        {
          _id: mockPlanIds.run,
          title: '🏃‍♀️ Run',
          date: mockDate,
          userId: mockUser.id,
          status: 'planned'
        },
        {
          _id: mockPlanIds.weightTraining,
          title: '🏋️‍♂️ Weight Training',
          date: mockDate,
          userId: mockUser.id,
          status: 'draft'
        }
      ] as any[];
      
      MockTrainPlanModel.insertMany.mockResolvedValueOnce(mockInsertedPlans);

      // Mock SubTask.insertMany with proper trainPlanId references
      const mockInsertedSubtasks = [
        {
          _id: new Types.ObjectId(),
          trainPlanId: mockPlanIds.run,  // Reference to first plan
          content: '5km easy run',
          completed: false
        },
        {
          _id: new Types.ObjectId(),
          trainPlanId: mockPlanIds.run,  // Reference to first plan
          content: 'Stretching after run',
          completed: false
        },
        {
          _id: new Types.ObjectId(),
          trainPlanId: mockPlanIds.weightTraining,  // Reference to second plan
          content: '3x10 Squats',
          completed: false
        }
      ] as any[];
      
      MockSubTaskModel.insertMany.mockResolvedValueOnce(mockInsertedSubtasks);

      await insertTrainPlan(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        message: 'Insert train plans success'
      });

      // Verify TrainPlan.insertMany was called with correct data
      const expectedTrainPlans = [
        {
          title: '🏃‍♀️ Run',
          date: mockDate,
          userId: mockUser.id,
          status: 'planned'
        },
        {
          title: '🏋️‍♂️ Weight Training',
          date: mockDate,
          userId: mockUser.id,
          status: 'draft'
        }
      ];
      expect(MockTrainPlanModel.insertMany).toHaveBeenCalledWith(expectedTrainPlans);

      // Verify SubTask.insertMany was called with correct data and references
      const expectedSubTasks = [
        {
          trainPlanId: mockPlanIds.run,
          content: '5km easy run',
          completed: false
        },
        {
          trainPlanId: mockPlanIds.run,
          content: 'Stretching after run',
          completed: false
        },
        {
          trainPlanId: mockPlanIds.weightTraining,
          content: '3x10 Squats',
          completed: false
        }
      ];
      expect(MockSubTaskModel.insertMany).toHaveBeenCalledWith(expectedSubTasks);

      // Verify the order of operations
      const trainPlanCallOrder = MockTrainPlanModel.insertMany.mock.invocationCallOrder[0];
      const subTaskCallOrder = MockSubTaskModel.insertMany.mock.invocationCallOrder[0];
      expect(trainPlanCallOrder).toBeLessThan(subTaskCallOrder);
    });

    test('should handle insertion error', async () => {
      // Mock TrainPlan.insertMany to throw error
      const error = new Error('Database error');
      MockTrainPlanModel.insertMany.mockRejectedValueOnce(error);

      await insertTrainPlan(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Insert train plans failed'
      });
    });
  });

  describe('fetchDurationPlan', () => {
    const mockUser = { id: 'mockUserId' };
    const mockStartDate = '2024-03-01';
    const mockEndDate = '2024-03-31';

    beforeEach(() => {
      mockRequest = {
        user: mockUser,
        query: {
          start: mockStartDate,
          end: mockEndDate
        }
      };

      // Mock mongoose.Types.ObjectId
      (mongoose.Types.ObjectId as unknown as jest.Mock).mockImplementation((id) => id);
    });

    test('should fetch plans with subtasks for date range', async () => {
      const mockAggregateResult = [
        {
          _id: 'plan1Id',
          title: '🏃‍♀️ Run',
          date: new Date('2024-03-20'),
          status: 'planned',
          subTasks: [
            {
              _id: 'subtask1Id',
              content: '5km easy run',
              completed: false
            }
          ]
        }
      ];

      // Mock TrainPlan.aggregate
      MockTrainPlanModel.aggregate.mockResolvedValueOnce(mockAggregateResult);

      await fetchDurationPlan(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        message: 'Insert train plans success',
        data: [
          {
            id: 'plan1Id',
            title: '🏃‍♀️ Run',
            date: new Date('2024-03-20'),
            status: 'planned',
            subTasks: [
              {
                id: 'subtask1Id',
                content: '5km easy run',
                completed: false
              }
            ]
          }
        ]
      });

      // Verify aggregate pipeline
      expect(MockTrainPlanModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId: 'mockUserId',
            date: {
              $gte: new Date(mockStartDate),
              $lte: new Date(mockEndDate)
            }
          }
        },
        {
          $lookup: {
            from: "subtasks",
            localField: "_id",
            foreignField: "trainPlanId",
            as: "subTasks"
          }
        }
      ]);
    });

    test('should handle fetch error', async () => {
      // Mock TrainPlan.aggregate to throw error
      const error = new Error('Database error');
      MockTrainPlanModel.aggregate.mockRejectedValueOnce(error);

      await fetchDurationPlan(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Fetch duration plans failed'
      });
    });
  });
}); 