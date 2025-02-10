import pino from "pino";

// Determine pino-pretty printing should be enabled (development only)
const isDevelopment = process.env.NODE_ENV === "development";

//Logger configuration
const logger = pino({
  level: process.env.LOG_LEVEL || "info", // Set log level from environment variable
  transport: isDevelopment
    ? {
        target: "pino-pretty", // Pretty-print logs in development
        options: {
          colorize: true, // Add colors to logs
          translateTime: "yyyy-mm-dd HH:MM:ss", // Format timestamps
        },
      }
    : undefined, // Use default JSON logs in production
});

export default logger;
