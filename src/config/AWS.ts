import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import { AwsConfig } from ".";
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



export const createS3Client = (config: AwsConfig) => {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

export const returnSignedCookies = () => {

  const privateKey = process.env.AWS_CLOUDFRONT_PRIVATEKEY!;
  
  // Parameters
  const cloudfrontUrl = process.env.COULDFRONT_URL||"";
  const keyPairId = process.env.KEYPAIR_ID||""; // From CloudFront public key
  const expires = Math.floor((Date.now() + 3 * 60 * 60 * 1000) / 1000); // 3 hours from now


  const signedCookie = getSignedCookies({
    keyPairId,
    privateKey,
    url: cloudfrontUrl,
    dateLessThan: expires,
  });
  return signedCookie;
}
