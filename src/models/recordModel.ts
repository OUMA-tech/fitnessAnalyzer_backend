import mongoose from 'mongoose';

interface RecordModel {
  userId: string;
  source: 'apple_watch' | 'garmin' | 'wahoo' | 'manual' | 'other';
  category: 'running' | 'cycling' | 'swimming' | 'other';
  distance: number; // km
  duration: number; // min
  heartRateAvg?: number;
  elevationGain?: number;
  calories?: number;
  timestamp: Date;
  rawData?: any;
}


const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, enum: ['apple_watch', 'garmin', 'wahoo', 'manual', 'other'] },
    activity: { type: String, required: true },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
    category: { type: String, enum: ['cycling', 'running', 'swimming', 'other'], required: true },
    heartRateAvg: { type: String },  
    elevationGain: { type: Number },
    calories: { type: Number },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// add index
recordSchema.index({ userId: 1 });
recordSchema.index({ category: 1 });
recordSchema.index({ source: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ userId: 1, category: 1 });
recordSchema.index({ userId: 1, date: -1 });

const Record = mongoose.model('Record', recordSchema);

export default Record;
