// import { Storage } from "@google-cloud/storage";

// export function parsePrivateKey(key: string | undefined): string | undefined {
//   if (!key) return undefined;
  
//   // Remove surrounding quotes if present
//   let cleanKey = key.startsWith('"') && key.endsWith('"') 
//     ? key.slice(1, -1) 
//     : key;
  
//   // Replace literal \n with actual newlines
//   cleanKey = cleanKey.replace(/\\n/g, '\n');
  
//   return cleanKey;
// }

// // 1. Configure Google Cloud Storage
// export const storage = new Storage({
//   projectId: process.env.GCS_PROJECT_ID,
//   credentials: {
//     client_email: process.env.GCS_CLIENT_EMAIL,
//     private_key: parsePrivateKey(process.env.GCS_PRIVATE_KEY),
//   },
// });


// export const bucketName = process.env.GCS_BUCKET_NAME!; 

import { Storage } from "@google-cloud/storage";

/**
 * Cloud Run-safe configuration.
 * Uses the service account attached to the Cloud Run service.
 */
export const storage = new Storage();

export const bucketName = process.env.GCS_BUCKET_NAME!;