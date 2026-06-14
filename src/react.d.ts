import type { RefObject } from 'react';
import type { NoiseFlowConfig } from './index.js';

export interface UseNoiseFlowResult {
  /** Attach to the `<canvas>` element. */
  canvasRef: RefObject<HTMLCanvasElement>;
  /** Attach to the container element. */
  containerRef: RefObject<HTMLElement>;
  /** Live-patch config without restarting the animation. */
  update(patch: Partial<NoiseFlowConfig>): void;
}

/**
 * React hook that mounts a noise-flow animation once and tears it down on unmount.
 * Pass config changes via the returned `update()` — do not rely on re-renders.
 */
export function useNoiseFlow(config?: NoiseFlowConfig): UseNoiseFlowResult;
