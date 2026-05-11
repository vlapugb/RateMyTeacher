"use client";

import { useCallback, useRef } from "react";

const SWIPE_THRESHOLD_PX = 60;

export function useSwipeNavigation(input: {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  blockNativeBackSwipe?: boolean;
  edgeSwipeBlockPx?: number;
}) {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const swipingRef = useRef(false);
  const edgeBlockingRef = useRef(false);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length !== 1) {
      startXRef.current = null;
      startYRef.current = null;
      swipingRef.current = false;
      edgeBlockingRef.current = false;
      return;
    }
    const touch = event.touches[0];
    const edgeSwipeBlockPx = input.edgeSwipeBlockPx ?? 28;

    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    swipingRef.current = false;
    edgeBlockingRef.current = Boolean(
      input.blockNativeBackSwipe &&
        input.canGoPrev &&
        touch.clientX <= edgeSwipeBlockPx,
    );

    if (edgeBlockingRef.current) {
      event.preventDefault();
    }
  }, [input.blockNativeBackSwipe, input.canGoPrev, input.edgeSwipeBlockPx]);

  const onTouchMove = useCallback((event: React.TouchEvent) => {
    if (startXRef.current == null || startYRef.current == null) return;
    if (event.touches.length !== 1) {
      startXRef.current = null;
      startYRef.current = null;
      swipingRef.current = false;
      edgeBlockingRef.current = false;
      return;
    }

    const deltaX = event.touches[0].clientX - startXRef.current;
    const deltaY = event.touches[0].clientY - startYRef.current;

    if (!swipingRef.current && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      swipingRef.current = true;
    }

    if (swipingRef.current || edgeBlockingRef.current) {
      event.preventDefault();
    }
  }, []);

  const onTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!swipingRef.current || startXRef.current == null) {
      startXRef.current = null;
      startYRef.current = null;
      swipingRef.current = false;
      edgeBlockingRef.current = false;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      startXRef.current = null;
      startYRef.current = null;
      swipingRef.current = false;
      edgeBlockingRef.current = false;
      return;
    }

    const delta = touch.clientX - startXRef.current;

    if (delta > SWIPE_THRESHOLD_PX && input.canGoPrev) {
      input.onPrev();
    } else if (delta < -SWIPE_THRESHOLD_PX && input.canGoNext) {
      input.onNext();
    }

    startXRef.current = null;
    startYRef.current = null;
    swipingRef.current = false;
    edgeBlockingRef.current = false;
  }, [input]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    containerStyle: { touchAction: "pan-y" } as React.CSSProperties,
  };
}
