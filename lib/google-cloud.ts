import { Storage } from "@google-cloud/storage";

const projectId = process.env.GCS_PROJECT_ID;
const clientEmail = process.env.GCS_CLIENT_EMAIL;
const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const storage = new Storage({
  ...(process.env.NODE_ENV==="development" && projectId && clientEmail && privateKey
    ? {
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
      }
    : {}),
});

export const bucketName = process.env.GCS_BUCKET_NAME!;