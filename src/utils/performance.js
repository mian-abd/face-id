// Performance monitoring and optimization utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      modelLoadTime: 0,
      imageProcessingTime: 0,
      predictionTime: 0,
      renderTime: 0,
    };
    this.observers = new Map();
  }

  // Measure function execution time
  async measureAsync(name, asyncFn) {
    const start = performance.now();
    try {
      const result = await asyncFn();
      const duration = performance.now() - start;
      this.metrics[name] = duration;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  // Measure synchronous function execution time
  measure(name, fn) {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.metrics[name] = duration;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  // Monitor component render performance
  observeComponent(componentName, element) {
    if (!element || this.observers.has(componentName)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes(componentName)) {
          console.log(`🔍 ${componentName} render: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['measure'] });
      this.observers.set(componentName, observer);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  // Stop observing component
  unobserveComponent(componentName) {
    const observer = this.observers.get(componentName);
    if (observer) {
      observer.disconnect();
      this.observers.delete(componentName);
    }
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      memory: this.getMemoryInfo(),
      timing: this.getTimingInfo(),
    };
  }

  // Get memory usage information
  getMemoryInfo() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  // Get navigation timing information
  getTimingInfo() {
    if ('getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
        };
      }
    }
    return null;
  }

  // Get First Paint timing
  getFirstPaint() {
    const paint = performance.getEntriesByType('paint');
    const fp = paint.find(entry => entry.name === 'first-paint');
    return fp ? fp.startTime : null;
  }

  // Get First Contentful Paint timing
  getFirstContentfulPaint() {
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  // Log performance summary
  logSummary() {
    const metrics = this.getMetrics();
    console.group('📊 Performance Summary');
    console.table(metrics);
    console.groupEnd();
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Image optimization utilities
export const imageUtils = {
  // Compress image to specified quality
  compressImage(file, quality = 0.8, maxWidth = 800, maxHeight = 600) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Convert canvas to base64 with optimization
  canvasToBase64(canvas, quality = 0.8) {
    return canvas.toDataURL('image/jpeg', quality);
  },

  // Preload images
  preloadImages(imageUrls) {
    return Promise.all(
      imageUrls.map(url => 
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        })
      )
    );
  },
};

// Memory management utilities
export const memoryUtils = {
  // Clean up TensorFlow.js tensors
  cleanupTensors() {
    if (typeof tf !== 'undefined') {
      const memBefore = tf.memory();
      tf.dispose();
      const memAfter = tf.memory();
      
      console.log(`🧹 Cleaned up ${memBefore.numTensors - memAfter.numTensors} tensors`);
      return memAfter;
    }
  },

  // Monitor memory usage
  monitorMemory(interval = 5000) {
    const monitor = setInterval(() => {
      const metrics = performanceMonitor.getMemoryInfo();
      if (metrics) {
        const usedMB = (metrics.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const totalMB = (metrics.totalJSHeapSize / 1024 / 1024).toFixed(2);
        console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB`);
      }
    }, interval);

    return () => clearInterval(monitor);
  },
};

// Lazy loading utilities
export const lazyUtils = {
  // Create intersection observer for lazy loading
  createLazyObserver(callback, options = {}) {
    const defaultOptions = {
      rootMargin: '100px',
      threshold: 0.1,
      ...options,
    };

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    }, defaultOptions);
  },

  // Lazy load component
  lazyLoadComponent(importFn) {
    return React.lazy(() => {
      return importFn().catch((error) => {
        console.error('Lazy loading failed:', error);
        // Return a fallback component
        return {
          default: () => React.createElement('div', {
            style: { padding: '20px', textAlign: 'center', color: '#ff6b6b' }
          }, '⚠️ Component failed to load')
        };
      });
    });
  },
};

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
    memoryUtils.cleanupTensors();
  });
}

export default performanceMonitor;
