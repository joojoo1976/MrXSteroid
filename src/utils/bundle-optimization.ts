/**
 * Bundle Optimization Utilities for Mr. X Steroid Application
 * Implements code splitting, lazy loading, and bundle size reduction techniques
 */

import { lazy, Suspense, ComponentType, LazyExoticComponent } from 'react';

export interface BundleOptimizerOptions {
    chunkSizeThreshold: number; // in KB
    enableCompression: boolean;
    enableTreeShaking: boolean;
    lazyLoadImages: boolean;
    preloadCritical: boolean;
}

const DEFAULT_BUNDLE_OPTS: BundleOptimizerOptions = {
    chunkSizeThreshold: 250, // 250KB
    enableCompression: true,
    enableTreeShaking: true,
    lazyLoadImages: true,
    preloadCritical: true
};

export class BundleOptimizer {
    private options: BundleOptimizerOptions;

    constructor(options?: Partial<BundleOptimizerOptions>) {
        this.options = { ...DEFAULT_BUNDLE_OPTS, ...options };
    }

    /**
     * Lazy load a component with error boundary fallback
     */
    lazyLoadComponent<T extends ComponentType<any>>(
        importFunc: () => Promise<{ default: T }>
    ): LazyExoticComponent<T> {
        return lazy(importFunc);
    }

    /**
     * Create suspense wrapper with fallback
     */
    createSuspenseWrapper(
        children: React.ReactNode,
        fallback: React.ReactNode = this.getDefaultFallback()
    ) {
        return (
            <Suspense fallback={fallback}>
                {children}
            </Suspense>
        );
    }

    /**
     * Default loading fallback
     */
    private getDefaultFallback() {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    /**
     * Optimize image loading with lazy loading
     */
    createOptimizedImage(
        src: string,
        alt: string,
        options?: { 
            className?: string; 
            width?: number; 
            height?: number;
            placeholder?: string;
        }
    ) {
        if (this.options.lazyLoadImages) {
            return (
                <img
                    src={options?.placeholder || '/placeholder.svg'}
                    data-src={src}
                    alt={alt}
                    className={`${options?.className || ''} lazy-image`}
                    width={options?.width}
                    height={options?.height}
                    onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            delete img.dataset.src;
                        }
                    }}
                />
            );
        }

        return (
            <img
                src={src}
                alt={alt}
                className={options?.className}
                width={options?.width}
                height={options?.height}
            />
        );
    }

    /**
     * Preload critical resources
     */
    preloadResource(url: string, type: 'script' | 'style' | 'font' | 'image') {
        if (!this.options.preloadCritical) return;

        const link = document.createElement('link');
        
        switch (type) {
            case 'script':
                link.rel = 'preload';
                link.as = 'script';
                break;
            case 'style':
                link.rel = 'preload';
                link.as = 'style';
                break;
            case 'font':
                link.rel = 'preload';
                link.as = 'font';
                link.crossOrigin = 'anonymous';
                break;
            case 'image':
                link.rel = 'preload';
                link.as = 'image';
                break;
        }
        
        link.href = url;
        document.head.appendChild(link);
    }

    /**
     * Code split large modules
     */
    async loadLargeModule(modulePath: string) {
        try {
            // Dynamically import module with error handling
            const module = await import(/* webpackChunkName: "[request]" */ modulePath);
            return module;
        } catch (error) {
            console.error(`Failed to load module ${modulePath}:`, error);
            throw error;
        }
    }

    /**
     * Optimize CSS by extracting critical CSS
     */
    extractCriticalCSS(html: string): { critical: string; deferred: string } {
        // This would be implemented with a CSS extraction tool in a real scenario
        // For now, we'll return the original HTML
        return {
            critical: html.substring(0, html.indexOf('</head>')),
            deferred: html.substring(html.indexOf('</head>'))
        };
    }

    /**
     * Optimize font loading
     */
    loadOptimizedFonts(fontUrls: string[]) {
        fontUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * Optimize script loading
     */
    loadOptimizedScript(src: string, async: boolean = true, defer: boolean = true) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = async;
            script.defer = defer;
            
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            document.head.appendChild(script);
        });
    }

    /**
     * Get bundle analysis
     */
    async analyzeBundle(): Promise<{
        totalSize: number;
        chunkSizes: { name: string; size: number }[];
        largestChunks: { name: string; size: number }[];
    }> {
        // In a real implementation, this would analyze the actual bundle
        // For now, we'll return mock data
        return {
            totalSize: 2450, // KB
            chunkSizes: [
                { name: 'main', size: 850 },
                { name: 'auth', size: 320 },
                { name: 'calculators', size: 680 },
                { name: 'chat', size: 450 },
                { name: 'checkout', size: 150 }
            ],
            largestChunks: [
                { name: 'calculators', size: 680 },
                { name: 'main', size: 850 },
                { name: 'chat', size: 450 }
            ]
        };
    }

    /**
     * Optimize bundle based on analysis
     */
    async optimizeBundle() {
        const analysis = await this.analyzeBundle();
        
        // Identify large chunks that could be split
        const largeChunks = analysis.chunkSizes.filter(chunk => 
            chunk.size > this.options.chunkSizeThreshold
        );
        
        console.log(`Found ${largeChunks.length} chunks exceeding threshold (${this.options.chunkSizeThreshold}KB)`);
        
        // In a real implementation, this would suggest or implement code splitting
        return {
            suggestions: largeChunks.map(chunk => ({
                chunk: chunk.name,
                size: chunk.size,
                recommendation: 'Consider code splitting this chunk'
            }))
        };
    }
}

// Export a singleton instance
export const bundleOptimizer = new BundleOptimizer();

// Export helper functions
export const lazyLoad = <T extends ComponentType<any>>(importFunc: () => Promise<{ default: T }>) => 
    lazy(importFunc);

export const OptimizedSuspense = ({ 
    children, 
    fallback = bundleOptimizer.getDefaultFallback() 
}: { 
    children: React.ReactNode; 
    fallback?: React.ReactNode 
}) => (
    <Suspense fallback={fallback}>
        {children}
    </Suspense>
);