import { handleError } from './error-handler'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  screen?: string
  action?: string
  metadata?: Record<string, unknown>
}

class Logger {
  private isDev = __DEV__

  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(`🐛 [DEBUG] ${this.formatMessage(message, context)}`)
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.info(`ℹ️ [INFO] ${this.formatMessage(message, context)}`)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.warn(`⚠️ [WARN] ${this.formatMessage(message, context)}`)
    }
  }

  error(error: string | Error, context?: LogContext): void {
    if (error instanceof Error) {
      handleError(error, context)
    } else {
      handleError(new Error(error), context)
    }
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (!context) return message

    const parts = []
    if (context.component) parts.push(`[${context.component}]`)
    if (context.screen) parts.push(`[${context.screen}]`)
    if (context.action) parts.push(`[${context.action}]`)
    
    const prefix = parts.length > 0 ? `${parts.join('')} ` : ''
    return `${prefix}${message}`
  }
}

export const logger = new Logger()