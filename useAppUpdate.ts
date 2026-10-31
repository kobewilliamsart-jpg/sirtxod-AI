import { useState, useEffect, useCallback, useRef } from 'react';

export const CURRENT_APP_VERSION = '2.2.0';

export interface UpdateInfo {
  version: string;
  changelog?: string;
}

export function useAppUpdate() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'up-to-date' | 'error'>('idle');
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const isUpdatingRef = useRef<boolean>(false);

  // Initialize service worker listeners
  useEffect(() => {
    try {
      if (!('serviceWorker' in navigator)) return;

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // ONLY reload when the user explicitly pressed update!
        if (!refreshing && isUpdatingRef.current) {
          refreshing = true;
          window.location.reload();
        }
      });

      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        registrationRef.current = reg;

        // Check if a worker is already waiting
        if (reg.waiting) {
          waitingWorkerRef.current = reg.waiting;
          setIsUpdateAvailable(true);
          setUpdateInfo({ version: 'Latest' });
        }

        // Listen for new worker updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              setIsUpdateAvailable(true);
              setUpdateInfo({ version: 'Latest' });
            }
          });
        });
      }).catch((e) => {
        console.warn('SW getRegistration error:', e);
      });

      // Check on startup safely
      checkServerVersion();

      // Periodic check every 15 minutes
      const interval = setInterval(() => {
        checkForUpdate(false);
      }, 15 * 60 * 1000);

      return () => clearInterval(interval);
    } catch (e) {
      console.warn('useAppUpdate init error:', e);
    }
  }, []);

  const checkServerVersion = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/version?t=${Date.now()}`);
      if (!res.ok) return false;
      const data = await res.json();

      let lastKnownVersion = CURRENT_APP_VERSION;
      try {
        lastKnownVersion = localStorage.getItem('sirtxod_installed_version') || CURRENT_APP_VERSION;
      } catch {
        // localStorage might be unavailable in some sandboxes
      }

      if (data.version && data.version !== lastKnownVersion) {
        setIsUpdateAvailable(true);
        setUpdateInfo({
          version: data.version,
          changelog: data.changelog,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const checkForUpdate = useCallback(async (isManual: boolean = true): Promise<boolean> => {
    setIsChecking(true);
    setCheckStatus('idle');

    let foundUpdate = false;

    try {
      // 1. Trigger Service Worker update check safely
      if (registrationRef.current) {
        await registrationRef.current.update().catch(() => {});
        if (registrationRef.current.waiting) {
          waitingWorkerRef.current = registrationRef.current.waiting;
          setIsUpdateAvailable(true);
          foundUpdate = true;
        }
      }

      // 2. Check server version
      const serverUpdated = await checkServerVersion();
      if (serverUpdated) {
        foundUpdate = true;
      }

      if (!foundUpdate && isManual) {
        setCheckStatus('up-to-date');
        setTimeout(() => setCheckStatus('idle'), 4000);
      }
    } catch (err) {
      console.warn('Update check error:', err);
      if (isManual) {
        setCheckStatus('error');
        setTimeout(() => setCheckStatus('idle'), 3000);
      }
    } finally {
      setIsChecking(false);
    }

    return foundUpdate;
  }, []);

  const applyUpdate = useCallback(() => {
    setIsUpdating(true);
    isUpdatingRef.current = true;

    // Save newly updated version to localStorage safely
    try {
      if (updateInfo?.version) {
        localStorage.setItem('sirtxod_installed_version', updateInfo.version);
      } else {
        localStorage.setItem('sirtxod_installed_version', CURRENT_APP_VERSION);
      }
    } catch {}

    // Tell waiting worker to take over
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
    }

    // Clear caches and reload
    setTimeout(async () => {
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch (e) {
        console.warn('Cache clearing issue:', e);
      }
      window.location.reload();
    }, 400);
  }, [updateInfo]);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
  }, []);

  return {
    isUpdateAvailable,
    isChecking,
    isUpdating,
    updateInfo,
    checkStatus,
    isBannerDismissed,
    checkForUpdate,
    applyUpdate,
    dismissBanner,
  };
}
