import { useState, useEffect, useCallback } from 'react';

const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Check if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isInWebApp);
    };

    checkInstalled();
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);
    
    return () => mediaQuery.removeEventListener('change', checkInstalled);
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('💾 Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('📴 Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker registration and updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('🔧 Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('🆕 Service worker update found');
        
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📦 New content available');
            setUpdateAvailable(true);
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('💬 Message from SW:', event.data);
        
        if (event.data.type === 'MODEL_UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  };

  // Install the app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ Install prompt not available');
      return false;
    }

    try {
      console.log('📱 Showing install prompt...');
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log('👤 User choice:', outcome);
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Install failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Update the app
  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('🔄 Updating app...');
      
      navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING'
      });
      
      // Reload the page to get the new version
      window.location.reload();
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  }, []);

  // Show notification
  const showNotification = useCallback(async (title, options = {}) => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      if (Notification.permission === 'granted') {
        return registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          vibrate: [100, 50, 100],
          ...options
        });
      }
    }
  }, []);

  // Share content (Web Share API)
  const shareContent = useCallback(async (shareData) => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        console.log('Share cancelled or failed:', error);
        return false;
      }
    } else {
      // Fallback to clipboard
      if (navigator.clipboard && shareData.url) {
        try {
          await navigator.clipboard.writeText(shareData.url);
          return true;
        } catch (error) {
          console.error('Clipboard write failed:', error);
          return false;
        }
      }
    }
    return false;
  }, []);

  // Get device info
  const getDeviceInfo = useCallback(() => {
    return {
      isStandalone: isInstalled,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      platform: navigator.platform,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : null,
      memory: navigator.deviceMemory || null,
      cores: navigator.hardwareConcurrency || null
    };
  }, [isInstalled]);

  // Cache management
  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Cache cleared');
        return true;
      } catch (error) {
        console.error('❌ Cache clear failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Estimate storage usage
  const getStorageEstimate = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        console.error('❌ Storage estimate failed:', error);
      }
    }
    return null;
  }, []);

  return {
    // State
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    
    // Actions
    installApp,
    updateApp,
    requestNotificationPermission,
    showNotification,
    shareContent,
    clearCache,
    
    // Utilities
    getDeviceInfo,
    getStorageEstimate,
    
    // Capabilities
    canInstall: isInstallable && !isInstalled,
    canShare: 'share' in navigator,
    canNotify: 'Notification' in window,
    hasServiceWorker: 'serviceWorker' in navigator,
  };
};

export default usePWA;
