import { SESClient } from "@aws-sdk/client-ses";
import { SesConfig } from ".";

// 创建 SES 客户端
export const createSesClient = (config: SesConfig) => {
    const sesClient = new SESClient({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
  return sesClient;
}
