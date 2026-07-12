import { z } from "zod";

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, "Firebase API Key is required"),
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "Firebase Auth Domain is required"),
  VITE_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "Firebase Project ID is required"),
  VITE_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "Firebase Storage Bucket is required"),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "Firebase Messaging Sender ID is required"),
  VITE_FIREBASE_APP_ID: z.string().min(1, "Firebase App ID is required"),
  // Optional but recommended fields
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_API_URL: z.string().url().optional(),
  VITE_MUX_ENV_KEY: z.string().optional(),
  VITE_STRIPE_PUB_KEY: z.string().optional(),
});

// Validate `import.meta.env` strictly on boot.
const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables. See console for details.");
}

export const env = parsedEnv.data;
