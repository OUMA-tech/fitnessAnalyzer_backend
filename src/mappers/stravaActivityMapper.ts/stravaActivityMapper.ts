import { RecordModel } from "../../interfaces/entity/stravaActivity";

export interface RecordMapper {
    findById: (id: string) => Promise<RecordModel | null>;
    findByUserId: (userId: string) => Promise<RecordModel[]>;
    create: (record: RecordModel) => Promise<RecordModel>;
    update: (id: string, record: RecordModel) => Promise<RecordModel | null>;
    delete: (id: string) => Promise<boolean>;
}
