import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { APP_VERSION, checkVersion, clearCacheAndReload } from '../utils/version';

const VersionChecker: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const hasNewVersion = checkVersion();
    if (hasNewVersion) {
      setShowUpdate(true);
    }

    const interval = setInterval(() => {
      const hasUpdate = checkVersion();
      if (hasUpdate) {
        setShowUpdate(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
        <RefreshCw className="h-5 w-5" />
        <div>
          <p className="font-medium">新しいバージョンが利用可能です</p>
          <p className="text-sm opacity-90">バージョン {APP_VERSION}</p>
        </div>
        <button
          onClick={clearCacheAndReload}
          className="bg-white text-primary-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
        >
          更新する
        </button>
        <button
          onClick={() => setShowUpdate(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default VersionChecker;
