import paypal from 'paypal-rest-sdk';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

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

export const createPayPalPayment = async (paymentData) => {
  return new Promise((resolve, reject) => {
    paypal.payment.create(paymentData, (error, payment) => {
      if (error) {
        logger.error('PayPal payment creation failed:', error.message);
        if (error.response) {
          console.error("PayPal Error Response:", JSON.stringify(error.response, null, 2));
        }
        
        reject(new Error(`Failed to create PayPal payment: ${error.response?.message || error.message}`));
      } else {
        logger.info("PayPal payment created successfully:", payment.id);
        resolve(payment);
      }
    });    
  });
}

export const getPayPalApprovalURL = (payment) => {
  const approvalURL = payment.links.find((link) => link.rel === 'approval_url')?.href;
  if (!approvalURL) {
    throw new Error('Approval URL not found in paypal payment response');
  }
  return approvalURL;
}

