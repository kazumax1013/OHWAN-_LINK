import React, { useState, useEffect } from 'react';
import heic2any from 'heic2any';

interface HeicImageProps {
  src: string;
  alt: string;
  className?: string;
}

const HeicImage: React.FC<HeicImageProps> = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let blobUrl: string | null = null;

    const convertHeicIfNeeded = async () => {
      const isHeic = src.toLowerCase().endsWith('.heic') || src.toLowerCase().endsWith('.heif');

      if (!isHeic) {
        setImageSrc(src);
        return;
      }

      setIsLoading(true);
      setError(false);

      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();

        const convertedBlob = await heic2any({
          blob,
          toType: 'image/jpeg',
          quality: 0.8
        });

        const jpegBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        blobUrl = URL.createObjectURL(jpegBlob);

        setImageSrc(blobUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Error converting HEIC image:', err);
        setError(true);
        setIsLoading(false);
      }
    };

    convertHeicIfNeeded();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <p className="text-gray-500 text-sm">画像を読み込めませんでした</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        console.error('Image load error:', imageSrc);
        setError(true);
      }}
      loading="lazy"
    />
  );
};

export default HeicImage;
