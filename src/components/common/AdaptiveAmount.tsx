import React, { useRef, useLayoutEffect, useCallback } from 'react';

export type AdaptiveScaleMode = 'hero' | 'metric' | 'compact' | 'title';

export interface AdaptiveAmountProps {
  value: string | number;
  className?: string;
  mode?: AdaptiveScaleMode;
  prefix?: string;
  title?: string;
  minFontSize?: number;
  maxFontSize?: number;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
}

const MODE_CONFIGS: Record<
  AdaptiveScaleMode,
  { max: number; min: number; fallbackClass: string }
> = {
  hero: {
    max: 34,
    min: 13,
    fallbackClass: 'text-2xl sm:text-3xl font-extrabold',
  },
  metric: {
    max: 14,
    min: 8,
    fallbackClass: 'text-xs sm:text-sm font-bold',
  },
  compact: {
    max: 14,
    min: 9,
    fallbackClass: 'text-xs sm:text-sm font-bold',
  },
  title: {
    max: 15,
    min: 10,
    fallbackClass: 'text-sm font-semibold',
  },
};

/**
 * AdaptiveAmount / AdaptiveText
 *
 * Automatically decreases font size step-by-step so that text fits its container
 * WITHOUT immediately cutting off or adding ellipsis (...).
 *
 * Only when the font size reaches its minimum readable threshold and the text
 * is STILL wider than the container, it gracefully applies ellipsis (...).
 */
export const AdaptiveAmount: React.FC<AdaptiveAmountProps> = ({
  value,
  className = '',
  mode = 'metric',
  prefix = '',
  title,
  minFontSize,
  maxFontSize,
  as: Component = 'span',
}) => {
  const fullText = `${prefix}${value ?? ''}`;
  const elRef = useRef<HTMLElement | null>(null);

  const config = MODE_CONFIGS[mode] || MODE_CONFIGS.metric;
  const max = maxFontSize ?? config.max;
  const min = minFontSize ?? config.min;

  const adjustFontSize = useCallback(() => {
    const el = elRef.current;
    if (!el) return;

    // Available width inside the element or its parent
    const availableWidth = el.clientWidth || el.parentElement?.clientWidth || 0;
    if (availableWidth <= 0) return;

    // Reset to maximum font size & clip text to measure natural scrollWidth
    el.style.fontSize = `${max}px`;
    el.style.textOverflow = 'clip';
    el.style.overflow = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.maxWidth = '100%';

    // If it already fits comfortably at the max font size, we are done!
    if (el.scrollWidth <= availableWidth) {
      el.style.textOverflow = 'clip';
      return;
    }

    // Binary search for the largest font size (between min and max) that fits without overflow
    let low = min;
    let high = max;
    let bestSize = min;

    for (let i = 0; i < 7; i++) {
      const mid = Math.round(((low + high) / 2) * 2) / 2;
      el.style.fontSize = `${mid}px`;
      if (el.scrollWidth <= availableWidth) {
        bestSize = mid;
        low = mid + 0.5; // Fits! Try a slightly larger font
      } else {
        high = mid - 0.5; // Overflowing, shrink font
      }
    }

    // Apply the optimal font size
    el.style.fontSize = `${bestSize}px`;

    // Only if even at bestSize (min threshold) it still exceeds available width,
    // apply ellipsis (...) as the final fallback
    if (el.scrollWidth > availableWidth) {
      el.style.textOverflow = 'ellipsis';
    } else {
      el.style.textOverflow = 'clip';
    }
  }, [max, min]);

  useLayoutEffect(() => {
    adjustFontSize();

    const el = elRef.current;
    if (!el) return;

    let resizeObserver: ResizeObserver | null = null;
    const targetToObserve = el.parentElement || el;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        adjustFontSize();
      });
      resizeObserver.observe(targetToObserve);
    }

    const handleWindowResize = () => {
      adjustFontSize();
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [fullText, adjustFontSize]);

  return (
    <Component
      ref={elRef as any}
      className={`inline-block w-full max-w-full overflow-hidden whitespace-nowrap tabular-nums leading-tight tracking-tight ${config.fallbackClass} ${className}`}
      title={title || fullText}
      style={{
        textOverflow: 'clip',
        fontSize: `${max}px`,
      }}
    >
      {fullText}
    </Component>
  );
};

// Alias for generic text auto-fitting
export const AdaptiveText = AdaptiveAmount;
