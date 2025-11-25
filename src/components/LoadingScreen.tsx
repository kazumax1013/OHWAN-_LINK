import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
    </div>
  );
};

export default LoadingScreen;