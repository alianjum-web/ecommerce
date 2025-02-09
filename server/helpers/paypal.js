import paypal from 'paypal-rest-sdk';
import logger from './logger';


const requiredEnvars = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];
for (const enVars of requiredEnvars) {
  if(!process.env[enVars]) {
    logger.error(`Missing required environment variables: ${enVars}`);
    throw new Error(`Missing required environment variables; ${enVars}`);
  }
}

// Configure Paypal
try {
  paypal.configure({
    mode: process.env.PAYPAL_MODE || "sandbox", // "sandbox" or "live": Default to sandbox if not set
    client_id: process.env.PAYPAL_CLIENT_ID, // Set this in .env
    client_secret: process.env.PAYPAL_CLIENT_SECRET, // Set this in .env
  });

  logger.info("PayPal SDK configured successfully.");
} catch (error) {
  logger.error("Failed too configure PayPal SDK:", error);
  throw new Error("Failed to configure PayPal SDK"); 
}

export default paypal;
