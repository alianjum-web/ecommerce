import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory (server/.env)
config({
  path: path.resolve(__dirname, "../../.env"),
});

// Export all environment variables
export default {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  PAYPAL_MODE: process.env.PAYPAL_MODE,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
};
