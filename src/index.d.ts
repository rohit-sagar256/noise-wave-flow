export type WorldOffset =
  | 'screen'
  | { x: number; y: number }
  | (() => { x: number; y: number });

export interface NoiseFlowConfig {
  /** Grid-point distance in px. Default: 28 */
  spacing?: number;
  /** Streamline steps per seed point. Default: 5 */
  steps?: number;
  /** Px per step at full mouse intensity. Default: 8 */
  stepLen?: number;
  /** Px per step at idle. Default: 2.5 */
  idleStep?: number;
  /** Px radius of wind influence around cursor. Default: 200 */
  windRadius?: number;
  /** Mouse position lerp speed (0–1). Default: 0.07 */
  mouseLerp?: number;
  /** Wind velocity lerp speed (0–1). Default: 0.18 */
  windLerp?: number;
  /** Mouse intensity fade-in/fade-out (0–1). Default: 0.055 */
  intensityLerp?: number;
  /** RGB components for rgba(), e.g. '37,99,235'. Default: '255,255,255' */
  color?: string;
  /** Base opacity at idle. Default: 0.3 */
  alpha?: number;
  /** Enable wind-cursor effect. Default: true */
  trackMouse?: boolean;
  /** Enable scroll-drift on streamlines. Default: true */
  trackScroll?: boolean;
  /** Offset noise coords for spatial continuity across multiple canvases. Default: null */
  worldOffset?: WorldOffset | null;
}

export interface NoiseFlowInstance {
  /** Live-patch config without restarting the animation. */
  update(patch: Partial<NoiseFlowConfig>): void;
  /** Stop the animation and remove all event listeners. */
  destroy(): void;
}

export interface MountedNoiseFlow extends NoiseFlowInstance {
  /** The canvas element that was created and injected into the container. */
  canvas: HTMLCanvasElement;
}

/**
 * Attach a noise-flow animation to an existing canvas element.
 */
export function createNoiseFlow(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  config?: NoiseFlowConfig,
): NoiseFlowInstance;

/**
 * Create and inject a `<canvas>`, then start the animation.
 * The canvas is absolutely positioned to fill the container.
 */
export function mountNoiseFlow(
  container: HTMLElement,
  config?: NoiseFlowConfig,
): MountedNoiseFlow;
