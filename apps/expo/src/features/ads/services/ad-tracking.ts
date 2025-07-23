import type { AdEvent, AdPlacement, AdType } from "../types"

class AdTrackingService {
  private events: AdEvent[] = []

  trackAdEvent(event: Omit<AdEvent, "timestamp">): void {
    const fullEvent: AdEvent = {
      ...event,
      timestamp: Date.now(),
    }

    this.events.push(fullEvent)

    // Log for development
    if (__DEV__) {
    }

    // Send to analytics service
    this.sendToAnalytics(fullEvent)
  }

  trackAdImpression(adType: AdType, placement: AdPlacement): void {
    this.trackAdEvent({
      type: "impression",
      adType,
      placement,
    })
  }

  trackAdClick(adType: AdType, placement: AdPlacement): void {
    this.trackAdEvent({
      type: "click",
      adType,
      placement,
    })
  }

  trackAdLoad(adType: AdType, placement: AdPlacement): void {
    this.trackAdEvent({
      type: "load",
      adType,
      placement,
    })
  }

  trackAdError(
    adType: AdType,
    placement: AdPlacement,
    errorMessage: string
  ): void {
    this.trackAdEvent({
      type: "error",
      adType,
      placement,
      errorMessage,
    })
  }

  trackAdClose(adType: AdType, placement: AdPlacement): void {
    this.trackAdEvent({
      type: "close",
      adType,
      placement,
    })
  }

  trackAdRevenue(
    adType: AdType,
    placement: AdPlacement,
    revenue: number
  ): void {
    this.trackAdEvent({
      type: "impression",
      adType,
      placement,
      revenue,
    })
  }

  private async sendToAnalytics(event: AdEvent): Promise<void> {
    try {
      // TODO: Integrate with existing observability package
      // For now, just log the event
      // In the future, this could send to analytics services like:
      // - Firebase Analytics
      // - PostHog
      // - Custom analytics endpoint

      if (__DEV__) {
      }
    } catch (error) {
      console.error("Failed to send ad analytics:", error)
    }
  }

  getEvents(limit?: number): AdEvent[] {
    if (limit) {
      return this.events.slice(-limit)
    }
    return [...this.events]
  }

  getEventsByType(type: AdEvent["type"], limit?: number): AdEvent[] {
    const filtered = this.events.filter(event => event.type === type)
    if (limit) {
      return filtered.slice(-limit)
    }
    return filtered
  }

  getEventsByPlacement(placement: AdPlacement, limit?: number): AdEvent[] {
    const filtered = this.events.filter(event => event.placement === placement)
    if (limit) {
      return filtered.slice(-limit)
    }
    return filtered
  }

  getRevenue(timeframe?: { from: number; to: number }): number {
    let events = this.events.filter(event => event.revenue !== undefined)

    if (timeframe) {
      events = events.filter(
        event =>
          event.timestamp >= timeframe.from && event.timestamp <= timeframe.to
      )
    }

    return events.reduce((total, event) => total + (event.revenue || 0), 0)
  }

  clearEvents(): void {
    this.events = []
  }
}

// Export singleton instance
export const adTrackingService = new AdTrackingService()
