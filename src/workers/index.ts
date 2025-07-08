import { createWorkerContainer } from "../container/worker.container";
import { createEmailWorker } from "../queues/emailWorker";
import { createSubscriptionWorker } from "../queues/subscriptionWorker";    

(async () => {
    const container = await createWorkerContainer();
    createEmailWorker(container.emailService, container.redisClient);
    createSubscriptionWorker(container.redisClient, container.subscriptionMapper);
})();
