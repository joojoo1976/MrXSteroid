/**
 * Memory Management Service for Mr. X Steroid Application
 * Handles memory optimization, cleanup, and performance monitoring
 */

export interface MemoryOptimizerOptions {
    gcThreshold: number; // in MB
    maxListeners: number;
    cleanupInterval: number; // in ms
    enableMonitoring: boolean;
}

const DEFAULT_MEMORY_OPTS: MemoryOptimizerOptions = {
    gcThreshold: 100, // 100MB
    maxListeners: 10,
    cleanupInterval: 30000, // 30 seconds
    enableMonitoring: true
};

export class MemoryManager {
    private options: MemoryOptimizerOptions;
    private cleanupIntervalId: NodeJS.Timeout | null = null;
    private eventListeners: Map<string, Array<() => void>>;
    private timers: Set<NodeJS.Timeout>;
    private intervals: Set<NodeJS.Timeout>;
    private observers: Set<IntersectionObserver | ResizeObserver | MutationObserver>;

    constructor(options?: Partial<MemoryOptimizerOptions>) {
        this.options = { ...DEFAULT_MEMORY_OPTS, ...options };
        this.eventListeners = new Map();
        this.timers = new Set();
        this.intervals = new Set();
        this.observers = new Set();
        
        if (this.options.enableMonitoring) {
            this.startCleanupInterval();
        }
    }

    /**
     * Start periodic cleanup
     */
    private startCleanupInterval() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
        }

        this.cleanupIntervalId = setInterval(() => {
            this.performCleanup();
        }, this.options.cleanupInterval);
    }

    /**
     * Perform memory cleanup
     */
    private performCleanup() {
        // Clean up expired listeners
        this.cleanupExpiredListeners();
        
        // Clean up unused timers
        this.cleanupUnusedTimers();
        
        // Clean up observers
        this.cleanupObservers();
        
        // Log memory usage if available
        this.logMemoryUsage();
    }

    /**
     * Clean up expired event listeners
     */
    private cleanupExpiredListeners() {
        // In a real implementation, we would track listener lifecycles
        // For now, we'll just ensure we don't exceed max listeners
        this.eventListeners.forEach((listeners, event) => {
            if (listeners.length > this.options.maxListeners) {
                console.warn(`Event ${event} has ${listeners.length} listeners, exceeding max of ${this.options.maxListeners}`);
            }
        });
    }

    /**
     * Clean up unused timers
     */
    private cleanupUnusedTimers() {
        // Timers and intervals are automatically cleaned up when they finish
        // But we can implement a tracking system to ensure cleanup
    }

    /**
     * Clean up observers
     */
    private cleanupObservers() {
        this.observers.forEach(observer => {
            if (observer instanceof IntersectionObserver || 
                observer instanceof ResizeObserver || 
                observer instanceof MutationObserver) {
                observer.disconnect();
            }
        });
        this.observers.clear();
    }

    /**
     * Log memory usage if available
     */
    private logMemoryUsage() {
        if (typeof performance !== 'undefined' && performance.memory) {
            const mem = performance.memory;
            console.log(`Memory Usage: ${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB/${Math.round(mem.jsHeapSizeLimit / 1024 / 1024)}MB`);
            
            if (mem.usedJSHeapSize > this.options.gcThreshold * 1024 * 1024) {
                console.warn(`Memory usage high: ${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB`);
            }
        }
    }

    /**
     * Add event listener with tracking
     */
    addTrackedEventListener<T extends EventTarget>(
        element: T,
        event: string,
        handler: EventListenerOrEventListenerObject
    ): () => void {
        element.addEventListener(event, handler);
        
        // Track the listener for cleanup
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        const listeners = this.eventListeners.get(event)!;
        listeners.push(() => element.removeEventListener(event, handler));
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler);
            const index = listeners.indexOf(() => element.removeEventListener(event, handler));
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    }

    /**
     * Create tracked timeout
     */
    setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
        const timeoutId = setTimeout(() => {
            callback();
            this.timers.delete(timeoutId);
        }, delay);
        
        this.timers.add(timeoutId);
        return timeoutId;
    }

    /**
     * Create tracked interval
     */
    setInterval(callback: () => void, interval: number): NodeJS.Timeout {
        const intervalId = setInterval(callback, interval);
        this.intervals.add(intervalId);
        return intervalId;
    }

    /**
     * Create tracked observer
     */
    createTrackedObserver<T extends IntersectionObserver | ResizeObserver | MutationObserver>(
        observer: T
    ): T {
        this.observers.add(observer);
        return observer;
    }

    /**
     * Force garbage collection (if available in environment)
     */
    forceGarbageCollection() {
        if ((globalThis as any).gc) {
            (globalThis as any).gc();
        }
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        if (typeof performance !== 'undefined' && performance.memory) {
            const mem = performance.memory;
            return {
                used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
                total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024),
                highWaterMark: this.options.gcThreshold
            };
        }
        
        return {
            used: 0,
            total: 0,
            limit: 0,
            highWaterMark: this.options.gcThreshold
        };
    }

    /**
     * Cleanup all tracked resources
     */
    cleanupAll() {
        // Clear cleanup interval
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }

        // Clean up all timers
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();

        // Clean up all intervals
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();

        // Clean up all observers
        this.observers.forEach(observer => {
            if (observer instanceof IntersectionObserver || 
                observer instanceof ResizeObserver || 
                observer instanceof MutationObserver) {
                observer.disconnect();
            }
        });
        this.observers.clear();

        // Clean up event listeners
        this.eventListeners.forEach(listeners => {
            listeners.forEach(cleanup => cleanup());
        });
        this.eventListeners.clear();
    }

    /**
     * Get tracked resource counts
     */
    getResourceCounts() {
        return {
            timers: this.timers.size,
            intervals: this.intervals.size,
            observers: this.observers.size,
            eventListeners: Array.from(this.eventListeners.values()).reduce((sum, listeners) => sum + listeners.length, 0)
        };
    }
}

// Export a singleton instance
export const memoryManager = new MemoryManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        memoryManager.cleanupAll();
    });
}