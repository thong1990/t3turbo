import * as Sentry from '@sentry/react-native'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorContext {
  user?: {
    id?: string
    email?: string
  }
  screen?: string
  action?: string
  timestamp?: Date
  metadata?: Record<string, unknown>
}

export class AppError extends Error {
  public readonly severity: ErrorSeverity
  public readonly context: ErrorContext
  public readonly isRetryable: boolean

  constructor(
    message: string,
    severity: ErrorSeverity = 'medium',
    context: ErrorContext = {},
    isRetryable = false
  ) {
    super(message)
    this.name = 'AppError'
    this.severity = severity
    this.context = { ...context, timestamp: new Date() }
    this.isRetryable = isRetryable
  }
}

export function handleError(
  error: Error | AppError,
  context: ErrorContext = {}
): void {
  const errorToReport = error instanceof AppError ? error : new AppError(
    error.message,
    'medium',
    context
  )

  // Log to console in development
  if (__DEV__) {
    console.error(`[${errorToReport.severity.toUpperCase()}] ${errorToReport.name}:`, {
      message: errorToReport.message,
      context: errorToReport.context,
      stack: errorToReport.stack,
    })
  }

  // Report to Sentry in production
  if (!__DEV__) {
    Sentry.addBreadcrumb({
      message: errorToReport.message,
      level: getSentryLevel(errorToReport.severity),
      data: errorToReport.context,
    })

    Sentry.captureException(errorToReport, {
      level: getSentryLevel(errorToReport.severity),
      tags: {
        severity: errorToReport.severity,
        retryable: errorToReport.isRetryable.toString(),
        screen: errorToReport.context.screen,
      },
    })
  }
}

function getSentryLevel(severity: ErrorSeverity): 'info' | 'warning' | 'error' | 'fatal' {
  switch (severity) {
    case 'low':
      return 'info'
    case 'medium':
      return 'warning'
    case 'high':
      return 'error'
    case 'critical':
      return 'fatal'
    default:
      return 'error'
  }
}

export function createRetryableError(message: string, context?: ErrorContext): AppError {
  return new AppError(message, 'medium', context, true)
}

export function createCriticalError(message: string, context?: ErrorContext): AppError {
  return new AppError(message, 'critical', context, false)
}