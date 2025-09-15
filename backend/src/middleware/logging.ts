import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  requestId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  error?: any;
  metadata?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLogEntry(entry: LogEntry): string {
    const baseInfo = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const requestInfo = entry.requestId ? `[${entry.requestId}]` : '';
    const methodInfo = entry.method && entry.url ? `${entry.method} ${entry.url}` : '';
    const statusInfo = entry.statusCode ? `-> ${entry.statusCode}` : '';
    const timeInfo = entry.responseTime ? `(${entry.responseTime}ms)` : '';
    
    return `${baseInfo} ${requestInfo} ${methodInfo} ${statusInfo} ${timeInfo} ${entry.message}`;
  }

  private log(entry: LogEntry): void {
    const formattedLog = this.formatLogEntry(entry);
    
    // In development, use console.log for better readability
    if (this.isDevelopment) {
      console.log(formattedLog);
      if (entry.metadata) {
        console.log('  Metadata:', JSON.stringify(entry.metadata, null, 2));
      }
      if (entry.error) {
        console.error('  Error:', entry.error);
      }
    } else {
      // In production, use structured logging
      console.log(JSON.stringify({
        ...entry,
        formatted: formattedLog
      }));
    }
  }

  info(message: string, requestId?: string, metadata?: any): void {
    this.log({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      requestId,
      metadata
    });
  }

  warn(message: string, requestId?: string, metadata?: any): void {
    this.log({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      requestId,
      metadata
    });
  }

  error(message: string, error?: any, requestId?: string, metadata?: any): void {
    this.log({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      requestId,
      error,
      metadata
    });
  }

  debug(message: string, requestId?: string, metadata?: any): void {
    if (this.isDevelopment) {
      this.log({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        requestId,
        metadata
      });
    }
  }

  // Request logging methods
  requestStart(req: Request, requestId: string): void {
    this.info('Request started', requestId, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length')
    });
  }

  requestEnd(req: Request, res: Response, requestId: string, responseTime: number): void {
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    const message = `Request completed`;
    
    this.log({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
  }

  requestError(req: Request, error: any, requestId: string): void {
    this.error('Request failed', error, requestId, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
  }
}

export const logger = new Logger();

// Express middleware for request logging
export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  // Add request ID to request object for use in other middleware
  (req as any).requestId = requestId;
  
  // Log request start
  logger.requestStart(req, requestId);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    logger.requestEnd(req, res, requestId, responseTime);
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error logging middleware
export const errorLogging = (error: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId;
  logger.requestError(req, error, requestId);
  next(error);
};
