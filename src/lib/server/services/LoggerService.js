/**
 * System-wide Logger Service.
 * Standardizes log format and provides a central point for logging configuration.
 */
export class LoggerService {
    constructor(context = 'App') {
        this.context = context;
    }

    /**
     * Create a new logger instance with a specific context.
     * @param {string} context 
     */
    static for(context) {
        return new LoggerService(context);
    }

    _format(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${metaStr}`;
    }

    info(message, meta) {
        console.log(this._format('info', message, meta));
    }

    warn(message, meta) {
        console.warn(this._format('warn', message, meta));
    }

    error(message, errorOrMeta) {
        let meta = errorOrMeta;
        if (errorOrMeta instanceof Error) {
            meta = {
                message: errorOrMeta.message,
                stack: errorOrMeta.stack,
                ...meta
            };
        }
        console.error(this._format('error', message, meta));
    }

    debug(message, meta) {
        // Only log debug in non-production or if explictly enabled? 
        // For now, we log everything since we are in dev/refactor mode.
        console.debug(this._format('debug', message, meta));
    }
}
