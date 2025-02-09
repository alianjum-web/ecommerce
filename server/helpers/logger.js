import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info", // Set log level from environment variable
  transport: {
    target: "pino-pretty", // Pretty-print logs in development
    options: {
      colorize: true, // Add colors to logs
      translateTime: "yyyy-mm-dd HH:MM:ss", // Format timestamps
    },
  },
});



export default logger;