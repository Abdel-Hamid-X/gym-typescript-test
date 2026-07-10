import { useRef, useCallback } from "react";

const SCROLL_STEP = 160;
const DRAG_THRESHOLD = 5; // px

/**
 * Returns props to spread onto a horizontally-scrollable tab bar div.
 * Enables mouse drag, scroll wheel redirect, and keyboard arrow key navigation.
 * Uses capture-phase click interception to ensure normal clicks are not blocked,
 * while preventing false clicks during dragging.
 */
export function useScrollableTabs() {
  const ref = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasMoved = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only respond to left click
      if (e.button !== 0) return;
      isDown.current = true;
      hasMoved.current = false;
      dragStartX.current = e.clientX;
      scrollStartX.current = ref.current?.scrollLeft ?? 0;
    },
    []
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDown.current || !ref.current) return;
      const deltaX = e.clientX - dragStartX.current;

      if (Math.abs(deltaX) > DRAG_THRESHOLD) {
        hasMoved.current = true;
        ref.current.scrollLeft = scrollStartX.current - deltaX;
        ref.current.style.cursor = "grabbing";
        ref.current.style.userSelect = "none";
      }
    },
    []
  );

  const stopDrag = useCallback(() => {
    isDown.current = false;
    if (ref.current) {
      ref.current.style.cursor = "";
      ref.current.style.userSelect = "";
    }
  }, []);

  // Intercept the click event during the capture phase (parent -> child)
  // to prevent child buttons from triggering if we actually dragged.
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMoved.current = false;
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!ref.current || e.deltaY === 0) return;
    e.preventDefault();
    ref.current.scrollLeft += e.deltaY;
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      ref.current.scrollLeft += SCROLL_STEP;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      ref.current.scrollLeft -= SCROLL_STEP;
    }
  }, []);

  return {
    ref,
    tabIndex: 0,
    role: "tablist" as const,
    onMouseDown,
    onMouseMove,
    onMouseUp: stopDrag,
    onMouseLeave: stopDrag,
    onClickCapture,
    onWheel,
    onKeyDown,
  };
}
