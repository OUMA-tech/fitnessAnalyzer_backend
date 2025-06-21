
export interface StravaActivityDto {
    id: string;
    userId: string;
    activityId: number;
    name: string;
    source: 'apple_watch' | 'garmin' | 'wahoo' | 'manual' | 'other';
    type: string;
    distance: number; // km
    movingTime: number; // min
    elapsedTime: number;
    averageHeartrate?: number;
    totalElevationGain?: number;
    averageSpeed: number;
    calories?: number;
    startDate: Date;
    rawData?: any;
}