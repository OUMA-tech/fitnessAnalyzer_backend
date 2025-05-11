import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: String, required: true },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
    category: { type: String, enum: ['cycling', 'running', 'swimming'], required: true },  // 新增类别字段
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Record = mongoose.model('Record', recordSchema);

export default Record;
