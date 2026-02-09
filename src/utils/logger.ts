/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  📝 MR. X STEROID - ENTERPRISE LOGGING SYSTEM                            ║
 * ║  Production-ready logging with environment awareness                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: string;
    message: string;
    data?: unknown;
}

import { env } from '../config/env';

/**
 * Check if we're in development mode
 */
const isDevelopment = (): boolean => {
    return env.MODE === 'development';
};

/**
 * Check if we're in production mode
 */
const isProduction = (): boolean => {
    return env.MODE === 'production';
};

/**
 * Format log entry for console output
 */
const formatLogEntry = (entry: LogEntry): string => {
    const { timestamp, level, module, message } = entry;
    return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;
};

/**
 * Get emoji for log level
 */
const getLevelEmoji = (level: LogLevel): string => {
    const emojis: Record<LogLevel, string> = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
    };
    return emojis[level];
};

/**
 * Create a logger instance for a specific module
 */
export const createLogger = (moduleName: string) => {
    const log = (level: LogLevel, message: string, data?: unknown): void => {
        // In production, only log warnings and errors
        if (isProduction() && (level === 'debug' || level === 'info')) {
            return;
        }

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            module: moduleName,
            message,
            data
        };

        const formattedMessage = formatLogEntry(entry);
        const emoji = getLevelEmoji(level);

        switch (level) {
            case 'debug':
                if (isDevelopment()) {
                    console.debug(`${emoji} ${formattedMessage}`, data ?? '');
                }
                break;
            case 'info':
                if (isDevelopment()) {
                    console.info(`${emoji} ${formattedMessage}`, data ?? '');
                }
                break;
            case 'warn':
                console.warn(`${emoji} ${formattedMessage}`, data ?? '');
                break;
            case 'error':
                console.error(`${emoji} ${formattedMessage}`, data ?? '');
                break;
        }
    };

    return {
        debug: (message: string, data?: unknown) => log('debug', message, data),
        info: (message: string, data?: unknown) => log('info', message, data),
        warn: (message: string, data?: unknown) => log('warn', message, data),
        error: (message: string, data?: unknown) => log('error', message, data),
    };
};

/**
 * Default application logger
 */
export const logger = createLogger('App');

/**
 * Pre-configured loggers for common modules
 */
export const loggers = {
    api: createLogger('API'),
    auth: createLogger('Auth'),
    payment: createLogger('Payment'),
    ai: createLogger('AI'),
    mcp: createLogger('MCP'),
    twilio: createLogger('Twilio'),
    context: createLogger('Context'),
};

export default logger;
