import "dotenv/config";
import { fromNodeProviderChain  } from "@aws-sdk/credential-providers";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import fs from 'fs';
import path from 'path';


export const s3 = new S3Client({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
