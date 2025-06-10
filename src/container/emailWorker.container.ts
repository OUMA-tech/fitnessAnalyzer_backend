import { createConfig } from "../config";
import { createRedisClient } from "../config/redis";
import { createSesClient } from "../config/ses";
import { createEmailQueue } from "../queues/emailQueue";
import { createEmailWorker } from "../queues/emailWorker";
import { createEmailService } from "../services/email/emailService";

export const createEmailWorkerContainer = () => {
    const config = createConfig();
    const sesClient = createSesClient(config.sesConfig);
    const redisClient = createRedisClient(config.redisConfig);
    const {emailQueue} = createEmailQueue(redisClient);

    const emailService = createEmailService({
        sesClient,
        source: config.sesConfig.source
    });
    const emailWorker = createEmailWorker(emailService);
    return emailWorker;
}
