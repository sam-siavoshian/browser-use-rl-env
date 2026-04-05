import { useState, useEffect, type RefObject } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export function useDimensions(ref: RefObject<HTMLElement | SVGElement | null>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateDimensions = () => {
      if (ref.current) {
        const el = ref.current;
        // Use layout box (offset*) for HTML; SVG uses bounding rect (offset* not on SVGElement in TS DOM).
        if (el instanceof HTMLElement) {
          setDimensions({ width: el.offsetWidth, height: el.offsetHeight });
        } else {
          const r = el.getBoundingClientRect();
          setDimensions({ width: r.width, height: r.height });
        }
      }
    };

    const debouncedUpdateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 250);
    };

    updateDimensions();
    window.addEventListener('resize', debouncedUpdateDimensions);

    return () => {
      window.removeEventListener('resize', debouncedUpdateDimensions);
      clearTimeout(timeoutId);
    };
  }, [ref]);

  return dimensions;
}
