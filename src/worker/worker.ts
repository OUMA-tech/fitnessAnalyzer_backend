import { createEmailWorker } from "../queues/emailWorker";

const emailWorker = createEmailWorker();
console.log("Creating email worker");
