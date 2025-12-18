import { X, ZoomIn } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

interface CertificateViewerProps {
  imageUrl: string;
  altText?: string;
}

export function CertificateViewer({ imageUrl, altText = 'Certificate' }: CertificateViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <>
      <Button
        variant='outline'
        onClick={() => setIsOpen(true)}
        className='gap-2'
      >
        <ZoomIn className='h-4 w-4' />
        View Certificate
      </Button>

      {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center'>
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className='absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition z-50'
            aria-label='Close'
          >
            <X className='h-6 w-6 text-white' />
          </button>

          {/* Title */}
          <div className='absolute top-4 left-4 text-white text-lg font-semibold'>
            {altText}
          </div>

          {/* Image */}
          <img
            src={imageUrl}
            alt={altText}
            className='w-full h-full object-contain'
          />

          {/* Click to close hint */}
          <button
            onClick={() => setIsOpen(false)}
            className='absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm hover:text-white transition'
          >
            Press ESC or click to close
          </button>
        </div>
      )}
    </>
  );
}
