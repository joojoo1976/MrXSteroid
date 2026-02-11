/**
 * Performance Optimization Utilities for Mr. X Steroid Application
 * Implements various performance enhancements and optimizations
 */

// Debounce utility to limit function calls
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function executedFunction(...args: Parameters<T>): void {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility to limit function calls over time
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function executedFunction(...args: Parameters<T>): void {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Memoization utility to cache function results
export function memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map<string, ReturnType<T>>();
    return function (...args: Parameters<T>): ReturnType<T> {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key) as ReturnType<T>;
        }
        const result = func.apply(this, args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    } as T;
}

// Lazy loading utility for images
export function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset.src || '';
                img.classList.remove('lazy');
                delete img.dataset.src;
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Virtual scrolling interface
export interface VirtualScrollOptions {
    container: HTMLElement;
    itemHeight: number;
    itemCount: number;
    renderItem: (index: number) => HTMLElement;
    overscan?: number;
}

// Virtual scrolling implementation
export class VirtualScroller {
    private container: HTMLElement;
    private itemHeight: number;
    private itemCount: number;
    private renderItem: (index: number) => HTMLElement;
    private overscan: number;
    private scrollTop: number = 0;
    private visibleStart: number = 0;
    private visibleEnd: number = 0;

    constructor(options: VirtualScrollOptions) {
        this.container = options.container;
        this.itemHeight = options.itemHeight;
        this.itemCount = options.itemCount;
        this.renderItem = options.renderItem;
        this.overscan = options.overscan || 5;

        this.setupContainer();
        this.bindEvents();
        this.render();
    }

    private setupContainer() {
        this.container.style.position = 'relative';
        this.container.style.overflowY = 'auto';
        this.container.style.height = `${this.itemHeight * 5}rem`; // Default height
        
        // Set content height
        const contentHeight = this.itemCount * this.itemHeight;
        const content = document.createElement('div');
        content.style.height = `${contentHeight}px`;
        content.setAttribute('data-virtual-content', '');
        this.container.appendChild(content);
    }

    private bindEvents() {
        this.container.addEventListener('scroll', () => {
            this.scrollTop = this.container.scrollTop;
            this.calculateVisibleRange();
            this.render();
        });
    }

    private calculateVisibleRange() {
        const start = Math.floor(this.scrollTop / this.itemHeight);
        const visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight);
        
        this.visibleStart = Math.max(0, start - this.overscan);
        this.visibleEnd = Math.min(this.itemCount, start + visibleCount + this.overscan);
    }

    private render() {
        const content = this.container.querySelector('[data-virtual-content]') as HTMLElement;
        if (!content) return;

        // Clear existing items
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }

        // Render visible items
        for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            const item = this.renderItem(i);
            item.style.position = 'absolute';
            item.style.top = `${i * this.itemHeight}px`;
            item.style.width = '100%';
            content.appendChild(item);
        }
    }
}

// Performance monitoring utility
export class PerformanceMonitor {
    private marks: Map<string, number> = new Map();
    private measures: Map<string, { start: string; end: string; duration: number }> = new Map();

    mark(name: string) {
        this.marks.set(name, performance.now());
    }

    measure(name: string, startMark: string, endMark: string) {
        const start = this.marks.get(startMark);
        const end = this.marks.get(endMark);
        
        if (start !== undefined && end !== undefined) {
            const duration = end - start;
            this.measures.set(name, { start: startMark, end: endMark, duration });
            return duration;
        }
        
        return null;
    }

    getMeasure(name: string) {
        return this.measures.get(name);
    }

    getAllMeasures() {
        return Array.from(this.measures.entries()).map(([name, measure]) => ({
            name,
            ...measure
        }));
    }

    report() {
        const measures = this.getAllMeasures();
        console.group('Performance Report');
        measures.forEach(({ name, duration }) => {
            console.log(`${name}: ${duration.toFixed(2)}ms`);
        });
        console.groupEnd();
    }
}

// Asset preloading utility
export class AssetPreloader {
    private static preloadQueue: string[] = [];
    private static preloadedAssets: Set<string> = new Set();

    static preload(assets: string | string[]) {
        const assetArray = Array.isArray(assets) ? assets : [assets];
        
        assetArray.forEach(asset => {
            if (!this.preloadedAssets.has(asset)) {
                this.preloadQueue.push(asset);
                this.processQueue();
            }
        });
    }

    private static processQueue() {
        if (this.preloadQueue.length === 0) return;

        const asset = this.preloadQueue.shift();
        if (!asset) return;

        if (asset.endsWith('.jpg') || asset.endsWith('.jpeg') || asset.endsWith('.png') || asset.endsWith('.gif')) {
            // Preload image
            const img = new Image();
            img.onload = () => {
                this.preloadedAssets.add(asset);
                this.processQueue(); // Process next item
            };
            img.onerror = () => {
                this.processQueue(); // Process next item even if error
            };
            img.src = asset;
        } else if (asset.endsWith('.css')) {
            // Preload CSS
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = asset;
            link.onload = () => {
                this.preloadedAssets.add(asset);
                this.processQueue();
            };
            link.onerror = () => {
                this.processQueue();
            };
            document.head.appendChild(link);
        } else if (asset.endsWith('.js')) {
            // Preload JavaScript
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = asset;
            link.onload = () => {
                this.preloadedAssets.add(asset);
                this.processQueue();
            };
            link.onerror = () => {
                this.processQueue();
            };
            document.head.appendChild(link);
        }
    }
}

// Memory management utility
export class MemoryManager {
    private static observers: Set<MutationObserver | ResizeObserver | IntersectionObserver> = new Set();
    private static timeouts: Set<NodeJS.Timeout> = new Set();
    private static intervals: Set<NodeJS.Timeout> = new Set();

    static registerObserver(observer: MutationObserver | ResizeObserver | IntersectionObserver) {
        this.observers.add(observer);
        return () => this.unregisterObserver(observer);
    }

    static unregisterObserver(observer: MutationObserver | ResizeObserver | IntersectionObserver) {
        observer.disconnect();
        this.observers.delete(observer);
    }

    static registerTimeout(timeoutId: NodeJS.Timeout) {
        this.timeouts.add(timeoutId);
        return () => this.unregisterTimeout(timeoutId);
    }

    static unregisterTimeout(timeoutId: NodeJS.Timeout) {
        clearTimeout(timeoutId);
        this.timeouts.delete(timeoutId);
    }

    static registerInterval(intervalId: NodeJS.Timeout) {
        this.intervals.add(intervalId);
        return () => this.unregisterInterval(intervalId);
    }

    static unregisterInterval(intervalId: NodeJS.Timeout) {
        clearInterval(intervalId);
        this.intervals.delete(intervalId);
    }

    static cleanup() {
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Clear all timeouts
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeouts.clear();

        // Clear all intervals
        this.intervals.forEach(intervalId => clearInterval(intervalId));
        this.intervals.clear();
    }
}

// Export a global performance monitor instance
export const perfMonitor = new PerformanceMonitor();