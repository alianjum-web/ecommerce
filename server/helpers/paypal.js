const paypal = require("paypal-rest-sdk");
require("dotenv").config(); // Load environment variables

paypal.configure({
  mode: process.env.PAYPAL_MODE || "sandbox", // "sandbox" or "live"
  client_id: process.env.PAYPAL_CLIENT_ID, // Set this in .env
  client_secret: process.env.PAYPAL_CLIENT_SECRET, // Set this in .env
});

module.exports = paypal;
