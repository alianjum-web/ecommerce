// utils/logger.ts
import { format } from 'date-fns';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

interface LoggerOptions {
  context: string;
  logToConsole?: boolean;
  remoteLogging?: {
    endpoint: string;
    levels: LogLevel[];
  };
}

export function createLogger(options: LoggerOptions): Logger {
  const { context, logToConsole = true, remoteLogging } = options;
  const prefix = `[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] [${context}]`;

  const log = (level: LogLevel, message: string, ...args: any[]) => {
    const formattedMessage = `${prefix} [${level.toUpperCase()}] ${message}`;
    
    // Console logging
    if (logToConsole) {
      const consoleMethod = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug,
      }[level];
      
      consoleMethod(formattedMessage, ...args);
    }

    // Remote logging (e.g., to a logging service)
    if (remoteLogging?.levels.includes(level)) {
      try {
        fetch(remoteLogging.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            context,
            message,
            timestamp: new Date().toISOString(),
            data: args.length ? args : undefined,
          }),
        }).catch(() => {}); // Silently fail if remote logging fails
      } catch (e) {}
    }
  };

  return {
    info: (message, ...args) => log('info', message, ...args),
    warn: (message, ...args) => log('warn', message, ...args),
    error: (message, ...args) => log('error', message, ...args),
    debug: (message, ...args) => {
      if (process.env.NODE_ENV === 'development') {
        log('debug', message, ...args);
      }
    },
  };
}