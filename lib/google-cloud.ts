import { Storage } from "@google-cloud/storage";

// 1. Configure Google Cloud Storage
export const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    // The key might be wrapped in quotes or have escaped newlines
    private_key: process.env.GCS_PRIVATE_KEY 
      ? process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
      : undefined,
  },
});


export const bucketName = process.env.GCS_BUCKET_NAME!; 