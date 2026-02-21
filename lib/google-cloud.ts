import { Storage } from "@google-cloud/storage";

export function parsePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // Remove surrounding quotes if present
  let cleanKey = key.startsWith('"') && key.endsWith('"') 
    ? key.slice(1, -1) 
    : key;
  
  // Replace literal \n with actual newlines
  cleanKey = cleanKey.replace(/\\n/g, '\n');
  
  return cleanKey;
}

// 1. Configure Google Cloud Storage
export const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: process.env.GCS_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.GCS_SERVICE_ACCOUNT)
    : undefined,
});


export const bucketName = process.env.GCS_BUCKET_NAME!; 