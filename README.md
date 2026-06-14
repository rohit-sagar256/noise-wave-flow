# noise-wave-flow

Organic noise-field canvas animation with a wind-cursor effect. Framework-agnostic with a React hook included.

---

## Install

```bash
npm install @elysian256/noise-wave-flow
```

---

## Usage

### Vanilla JS

```js
import { createNoiseFlow } from '@elysian256/noise-wave-flow';

const canvas    = document.getElementById('my-canvas');
const container = document.getElementById('my-section');

const flow = createNoiseFlow(canvas, container, {
  color: '255,255,255',
  alpha: 0.14,
});

// Later — live-update a config value without restarting
flow.update({ alpha: 0.08 });

// Cleanup
flow.destroy();
```

**Auto-inject canvas** (no canvas element in HTML required):

```js
import { mountNoiseFlow } from '@elysian256/noise-wave-flow';

const flow = mountNoiseFlow(document.getElementById('hero'), {
  color: '255,255,255',
});

flow.destroy(); // also removes the injected canvas
```

---

### React

```jsx
import { useNoiseFlow } from '@elysian256/noise-wave-flow/react';

function Hero() {
  const { canvasRef, containerRef } = useNoiseFlow({
    color: '255,255,255',
    alpha: 0.14,
  });

  return (
    <section
      ref={containerRef}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* your content */}
      </div>
    </section>
  );
}
```

**Live-updating config:**

```jsx
const { canvasRef, containerRef, update } = useNoiseFlow({ alpha: 0.14 });

// Toggle to a dimmer field on some event
update({ alpha: 0.06 });
```

---

### Spatial continuity (multiple canvases sharing one field)

If you have two canvases — e.g. a hero and a sidebar panel — you can make them
render the same continuous wave field by offsetting the noise coordinates:

```js
// Panel canvas evaluates the field at its real screen position
const panel = createNoiseFlow(panelCanvas, panelEl, {
  worldOffset: 'screen',  // reads getBoundingClientRect() on resize
  trackMouse: false,       // no wind in the panel, pure noise
  steps: 3,
  stepLen: 4,
});
```

Or with a fixed offset:

```js
const panel = createNoiseFlow(panelCanvas, panelEl, {
  worldOffset: { x: 840, y: 72 },
});
```

Or dynamically, for a scrolling container:

```js
const panel = createNoiseFlow(panelCanvas, panelEl, {
  worldOffset: () => {
    const r = panelCanvas.getBoundingClientRect();
    return { x: r.left, y: r.top };
  },
});
```

---

## Config reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `spacing` | `number` | `28` | Grid-point distance in px |
| `steps` | `number` | `5` | Streamline steps per seed point |
| `stepLen` | `number` | `8` | Px per step at full mouse intensity |
| `idleStep` | `number` | `2.5` | Px per step at idle — keeps dots visibly breathing |
| `windRadius` | `number` | `200` | Px radius of wind influence around cursor |
| `mouseLerp` | `number` | `0.07` | Mouse position lerp speed (0–1, lower = smoother) |
| `windLerp` | `number` | `0.18` | Wind velocity lerp speed (0–1) |
| `intensityLerp` | `number` | `0.055` | Mouse-hover fade-in / fade-out speed (0–1) |
| `color` | `string` | `'255,255,255'` | RGB components for `rgba()`, e.g. `'37,99,235'` for blue |
| `alpha` | `number` | `0.3` | Base opacity at idle |
| `trackMouse` | `boolean` | `true` | Enable wind-cursor effect |
| `trackScroll` | `boolean` | `true` | Enable scroll-drift on streamlines |
| `worldOffset` | `{x,y}` \| `() => {x,y}` \| `'screen'` | `null` | Offset noise coordinates for spatial continuity across canvases |

---

## How it works

Each frame, a grid of seed points is stepped through a vector field defined by
4-octave sine-based noise. At idle the steps are very short (dots breathe
softly). When the mouse enters, two things happen:

1. **Wind** — `mouseIntensity` lerps to 1, growing the step length into full
   streamlines. The mouse velocity is derived from the position lerp delta and
   used to bend lines within `windRadius` in the direction of cursor movement.

2. **Brightness** — lines near the cursor are batched into a separate draw call
   at slightly higher opacity.

Touch is also tracked so the wind effect works on mobile.

---

## Credits

Built by [Rohit Sagar](https://github.com/rohit-sagar256) at [Multioriontech](https://multioriontech.com).  
Originally created for the [Multioriontech website](https://multioriontech.com).

---

## License

MIT
