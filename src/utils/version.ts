export const APP_VERSION = '1.0.1';

export const checkVersion = (): boolean => {
  const storedVersion = localStorage.getItem('app_version');

  if (storedVersion !== APP_VERSION) {
    localStorage.setItem('app_version', APP_VERSION);
    return true;
  }

  return false;
};

export const clearCacheAndReload = (): void => {
  localStorage.setItem('app_version', APP_VERSION);

  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }

  window.location.reload();
};
