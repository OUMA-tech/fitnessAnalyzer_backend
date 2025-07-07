import { SubscriptionPlanModel } from "../../models/subscriptionPlansModel";
import { Model } from 'mongoose';
import { SubscriptionPlansMapper } from "./subscriptionPlansMapper";
import { toClientList } from "../../utils/toClient";
export const createMongoSubscriptionPlansMapper = (SubscriptionPlanModel:Model<SubscriptionPlanModel>):SubscriptionPlansMapper => {
  return{
    countDocuments:() => SubscriptionPlanModel.countDocuments().exec(),
    insertMany: async (plans) => {
      await SubscriptionPlanModel.insertMany(plans);
      return true;
    },
    findAll: async() => {
      const allDocs = await SubscriptionPlanModel.find().lean();
      return allDocs? toClientList(allDocs) : null;
    },
  }

}