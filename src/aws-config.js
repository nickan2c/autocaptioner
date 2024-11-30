import { S3Client } from "@aws-sdk/client-s3";
import { TranscribeClient } from "@aws-sdk/client-transcribe";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const REGION = process.env.REACT_APP_AWS_REGION;
const identityPoolId = process.env.REACT_APP_IDENTITY_POOL_ID;

console.log( Date.now()); 
export const s3Client = new S3Client({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: REGION },
    identityPoolId: identityPoolId,
  }),
});

export const transcribeClient = new TranscribeClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: REGION },
    identityPoolId: identityPoolId,
  }),
});
