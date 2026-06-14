import { useEffect, useRef, useCallback } from 'react';
import { createNoiseFlow } from './core.js';

/**
 * React hook for noise-flow.
 *
 * Usage:
 * ```jsx
 * function Hero() {
 *   const { canvasRef, containerRef } = useNoiseFlow({ color: '255,255,255' });
 *   return (
 *     <section ref={containerRef} style={{ position: 'relative' }}>
 *       <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
 *       <div style={{ position: 'relative', zIndex: 1 }}>…content…</div>
 *     </section>
 *   );
 * }
 * ```
 *
 * Config is read once on mount. To live-update individual options without
 * restarting the animation, use the returned `update` function.
 *
 * @param {import('./core.js').NoiseFlowConfig} [config]
 * @returns {{ canvasRef: React.RefObject, containerRef: React.RefObject, update: (patch: Partial<import('./core.js').NoiseFlowConfig>) => void }}
 */
export function useNoiseFlow(config = {}) {
    const canvasRef    = useRef(null);
    const containerRef = useRef(null);
    const instanceRef  = useRef(null);
    const configRef    = useRef(config);

    // Keep configRef in sync without triggering a remount
    useEffect(() => {
        configRef.current = config;
    });

    useEffect(() => {
        const canvas    = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        instanceRef.current = createNoiseFlow(canvas, container, configRef.current);

        return () => {
            instanceRef.current?.destroy();
            instanceRef.current = null;
        };
    }, []); // intentionally empty — mount once, destroy on unmount

    const update = useCallback((patch) => {
        instanceRef.current?.update(patch);
    }, []);

    return { canvasRef, containerRef, update };
}
