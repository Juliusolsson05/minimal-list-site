'use client';

import React, { useRef, useState, useEffect } from 'react';

const DEFAULT_CONFIG = {
  frameWidth: 10,
  shadowIntensity: 0.4,
  shadowBlur: 46,
  shadowSpread: 5,
  bgColor: '#ffffff',
  frameColor: '#1a1a1a',
  textureIntensity: 0.35,
  matteWidth: 6,
  matteColor: '#ffffff',
  woodTextureIntensity: 0.6,
  backdropGlow: 0.25
};

interface PosterRendererProps {
  posterImage?: string;
  onRendered?: (dataUrl: string) => void;
}

export default function PosterRenderer({ posterImage, onRendered }: PosterRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayCanvas, setDisplayCanvas] = useState<string | null>(null);

  useEffect(() => {
    const renderPoster = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: false });
      if (!ctx) return;

      canvas.width = 1024;
      canvas.height = 1024;
      ctx.clearRect(0, 0, 1024, 1024);

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      try {
        if (!posterImage) {
          setDisplayCanvas(null);
          return;
        }

        const poster = await loadImage(posterImage);

        // Fill background
        ctx.fillStyle = DEFAULT_CONFIG.bgColor;
        ctx.fillRect(0, 0, 1024, 1024);

        // Calculate dimensions
        const totalPadding = 120;
        const frameW = DEFAULT_CONFIG.frameWidth;
        const matteW = DEFAULT_CONFIG.matteWidth;
        const availableSize = 1024 - (totalPadding * 2) - (frameW * 2) - (matteW * 2);

        const scale = Math.min(availableSize / poster.width, availableSize / poster.height);
        const posterWidth = poster.width * scale;
        const posterHeight = poster.height * scale;

        const centerX = 512;
        const centerY = 512;

        const frameOuterWidth = posterWidth + (matteW * 2) + (frameW * 2);
        const frameOuterHeight = posterHeight + (matteW * 2) + (frameW * 2);
        const frameX = centerX - frameOuterWidth / 2;
        const frameY = centerY - frameOuterHeight / 2;

        // Backdrop glow
        if (DEFAULT_CONFIG.backdropGlow > 0) {
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, frameOuterWidth * 0.7);
          gradient.addColorStop(0, `rgba(0,0,0,${DEFAULT_CONFIG.backdropGlow * 0.4})`);
          gradient.addColorStop(0.4, `rgba(0,0,0,${DEFAULT_CONFIG.backdropGlow * 0.2})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 1024, 1024);
        }

        // Frame with shadow
        ctx.save();
        ctx.shadowColor = `rgba(0,0,0,${DEFAULT_CONFIG.shadowIntensity})`;
        ctx.shadowBlur = DEFAULT_CONFIG.shadowBlur;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = DEFAULT_CONFIG.frameColor;
        ctx.fillRect(frameX, frameY, frameOuterWidth, frameOuterHeight);
        ctx.restore();

        // Wood texture
        if (DEFAULT_CONFIG.woodTextureIntensity > 0) {
          ctx.save();
          ctx.globalAlpha = DEFAULT_CONFIG.woodTextureIntensity * 0.3;
          for (let i = 0; i < frameOuterWidth; i += 3) {
            if (Math.random() > 0.7) {
              ctx.fillStyle = 'rgba(255,255,255,0.1)';
              ctx.fillRect(frameX + i, frameY, 2, frameOuterHeight);
            }
          }
          ctx.restore();
        }

        // Matte
        if (DEFAULT_CONFIG.matteWidth > 0) {
          const matteX = frameX + frameW;
          const matteY = frameY + frameW;
          const matteOuterWidth = frameOuterWidth - (frameW * 2);
          const matteOuterHeight = frameOuterHeight - (frameW * 2);

          ctx.fillStyle = DEFAULT_CONFIG.matteColor;
          ctx.fillRect(matteX, matteY, matteOuterWidth, matteOuterHeight);

          // Matte texture
          ctx.save();
          ctx.globalAlpha = 0.15;
          for (let i = 0; i < matteOuterHeight; i += 2) {
            if (Math.random() > 0.5) {
              ctx.fillStyle = 'rgba(0,0,0,0.05)';
              ctx.fillRect(matteX, matteY + i, matteOuterWidth, 1);
            }
          }
          ctx.restore();
        }

        // Draw white background for poster area (so transparency shows white)
        const posterX = centerX - posterWidth / 2;
        const posterY = centerY - posterHeight / 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(posterX, posterY, posterWidth, posterHeight);

        // Draw poster
        ctx.drawImage(poster, posterX, posterY, posterWidth, posterHeight);

        // Paper texture
        if (DEFAULT_CONFIG.textureIntensity > 0) {
          ctx.save();
          ctx.globalAlpha = DEFAULT_CONFIG.textureIntensity * 0.4;
          ctx.globalCompositeOperation = 'overlay';

          for (let y = posterY; y < posterY + posterHeight; y += 2) {
            for (let x = posterX; x < posterX + posterWidth; x += 2) {
              if (Math.random() > 0.5) {
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
                ctx.fillRect(x, y, 1, 1);
              }
            }
          }
          ctx.restore();
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Optimized JPEG instead of PNG for smaller size
        setDisplayCanvas(dataUrl);

        if (onRendered && posterImage) {
          onRendered(dataUrl);
        }

      } catch (error) {
        console.error('Error rendering poster:', error);
      }
    };

    renderPoster();
  }, [posterImage, onRendered]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className="hidden"
      />

      <div className="relative w-full max-w-md">
        {displayCanvas ? (
          <img
            src={displayCanvas}
            alt="Poster Render"
            className="w-full h-auto object-contain rounded-lg"
          />
        ) : (
          <div className="w-full aspect-square border-2 border-dashed border-border flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Upload a poster to preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
