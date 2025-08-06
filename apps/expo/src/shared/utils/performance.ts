import { InteractionManager } from 'react-native'

export interface PerformanceMetrics {
  renderTime: number
  interactionTime?: number
  memoryUsage?: number
}

// Safe performance.now() fallback
const now = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }
  return Date.now()
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetrics> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startRenderTimer(screenName: string): () => void {
    const startTime = now()
    
    return () => {
      const renderTime = now() - startTime
      this.recordMetric(screenName, { renderTime })
      
      if (__DEV__ && renderTime > 100) {
        console.warn(`🐌 Slow render detected: ${screenName} took ${renderTime.toFixed(2)}ms`)
      }
    }
  }

  measureInteraction<T>(
    screenName: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = now()
    
    return operation().finally(() => {
      const interactionTime = now() - startTime
      const existing = this.metrics.get(screenName) || { renderTime: 0 }
      this.recordMetric(screenName, { 
        ...existing, 
        interactionTime 
      })
      
      if (__DEV__ && interactionTime > 50) {
        console.warn(`🐌 Slow interaction: ${screenName} took ${interactionTime.toFixed(2)}ms`)
      }
    })
  }

  recordMetric(screenName: string, metrics: Partial<PerformanceMetrics>): void {
    const existing = this.metrics.get(screenName) || { renderTime: 0 }
    this.metrics.set(screenName, { ...existing, ...metrics })
  }

  getMetrics(screenName?: string): PerformanceMetrics | Map<string, PerformanceMetrics> {
    if (screenName) {
      return this.metrics.get(screenName) || { renderTime: 0 }
    }
    return this.metrics
  }

  clearMetrics(): void {
    this.metrics.clear()
  }

  logSummary(): void {
    if (!__DEV__) return
    
    console.group('📊 Performance Summary')
    this.metrics.forEach((metrics, screenName) => {
      console.log(`${screenName}:`, {
        render: `${metrics.renderTime.toFixed(2)}ms`,
        interaction: metrics.interactionTime ? `${metrics.interactionTime.toFixed(2)}ms` : 'N/A',
        memory: metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(2)}MB` : 'N/A'
      })
    })
    console.groupEnd()
  }
}

export function usePerformanceMonitor(screenName: string) {
  const monitor = PerformanceMonitor.getInstance()
  
  const measureRender = (callback: () => void) => {
    const stopTimer = monitor.startRenderTimer(screenName)
    
    // Wait for interactions to complete before measuring
    InteractionManager.runAfterInteractions(() => {
      callback()
      stopTimer()
    })
  }

  const measureInteraction = <T>(operation: () => Promise<T>): Promise<T> => {
    return monitor.measureInteraction(screenName, operation)
  }

  return {
    measureRender,
    measureInteraction,
    getMetrics: () => monitor.getMetrics(screenName) as PerformanceMetrics,
  }
}

// Memory monitoring utilities
export const getMemoryUsage = (): number => {
  try {
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc()
    }
    
    // Try to get memory usage from different sources
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
    
    if (typeof global !== 'undefined' && (global as any).performance?.memory) {
      return (global as any).performance.memory.usedJSHeapSize / 1024 / 1024
    }
    
    return 0
  } catch {
    return 0
  }
}

export const logMemoryUsage = (context: string): void => {
  if (__DEV__) {
    const usage = getMemoryUsage()
    if (usage > 50) {
      console.warn(`🧠 High memory usage in ${context}: ${usage.toFixed(2)}MB`)
    }
  }
}