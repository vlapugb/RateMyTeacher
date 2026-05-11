"use client";

import { useCallback, useRef } from "react";

const SWIPE_THRESHOLD_PX = 70;

export function useSwipeNavigation(input: {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}) {
  const startXRef = useRef<number | null>(null);
  const deltaRef = useRef(0);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length !== 1) {
      startXRef.current = null;
      return;
    }
    startXRef.current = event.touches[0].clientX;
    deltaRef.current = 0;
  }, []);

  const onTouchMove = useCallback((event: React.TouchEvent) => {
    if (startXRef.current == null || event.touches.length !== 1) return;
    deltaRef.current = event.touches[0].clientX - startXRef.current;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (startXRef.current == null) return;

    const delta = deltaRef.current;

    if (delta > SWIPE_THRESHOLD_PX && input.canGoPrev) {
      input.onPrev();
    } else if (delta < -SWIPE_THRESHOLD_PX && input.canGoNext) {
      input.onNext();
    }

    startXRef.current = null;
    deltaRef.current = 0;
  }, [input]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
