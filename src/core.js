/**
 * noise-flow — core animation engine
 *
 * Creates an organic noise field on a <canvas> with an optional wind-cursor
 * effect. Framework-agnostic: receives DOM elements directly.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement}       container  Sized to match; mouse events sourced here.
 * @param {NoiseFlowConfig}   userConfig
 * @returns {{ update(patch: Partial<NoiseFlowConfig>): void, destroy(): void }}
 */

/** @typedef {Object} NoiseFlowConfig
 * @property {number}  [spacing=28]          Grid-point distance in px
 * @property {number}  [steps=5]             Streamline steps per seed
 * @property {number}  [stepLen=8]           Px per step at full mouse intensity
 * @property {number}  [idleStep=2.5]        Px per step at idle (keeps dots breathing)
 * @property {number}  [windRadius=200]      Px radius of wind influence around cursor
 * @property {number}  [mouseLerp=0.07]      Mouse position lerp speed  (0–1)
 * @property {number}  [windLerp=0.18]       Wind velocity lerp speed   (0–1)
 * @property {number}  [intensityLerp=0.055] Mouse fade-in / fade-out   (0–1)
 * @property {string}  [color='255,255,255'] RGB components for rgba(), e.g. '37,99,235'
 * @property {number}  [alpha=0.14]          Base opacity at idle
 * @property {boolean} [trackMouse=true]     Enable wind-cursor effect
 * @property {boolean} [trackScroll=true]    Enable scroll-drift on streamlines
 * @property {WorldOffset} [worldOffset]     Offset noise coords for spatial continuity
 */

/** @typedef {{ x: number, y: number } | (() => { x: number, y: number }) | 'screen'} WorldOffset
 *  - Plain object  → fixed offset
 *  - Function      → called every frame (e.g. for a scrolling container)
 *  - 'screen'      → auto-reads canvas.getBoundingClientRect() on each resize;
 *                    use this when the canvas is a sub-section of a larger field
 */

const DEFAULTS = {
    spacing: 28,
    steps: 5,
    stepLen: 8,
    idleStep: 2.5,
    windRadius: 200,
    mouseLerp: 0.07,
    windLerp: 0.18,
    intensityLerp: 0.055,
    color: '255,255,255',
    alpha: 0.3,
    trackMouse: true,
    trackScroll: true,
    worldOffset: null,
    gradient: null,
    gradientAngle: 135,
};

export function createNoiseFlow(canvas, container, userConfig = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { update: () => {}, destroy: () => {} };

    const cfg = { ...DEFAULTS, ...userConfig };

    // ── State ──────────────────────────────────────────────────────────────────
    let mouseX = -9999, mouseY = -9999;
    let targetMouseX = -9999, targetMouseY = -9999;
    let mouseOn = false;
    let mouseIntensity = 0;
    let windVX = 0, windVY = 0;
    let scrollVel = 0, prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let visible = true;
    let sized = false;
    let rafId = null;
    // For worldOffset:'screen'
    let screenOffsetX = 0, screenOffsetY = 0;
    // For gradient
    let cachedGradient = null;

    // ── Gradient builder ───────────────────────────────────────────────────────
    function buildGradient() {
        if (!cfg.gradient || cfg.gradient.length < 2) { cachedGradient = null; return; }
        const angle = (cfg.gradientAngle * Math.PI) / 180;
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const len = Math.hypot(canvas.width, canvas.height) / 2;
        const grad = ctx.createLinearGradient(
            cx - Math.cos(angle) * len, cy - Math.sin(angle) * len,
            cx + Math.cos(angle) * len, cy + Math.sin(angle) * len,
        );
        cfg.gradient.forEach((c, i) => grad.addColorStop(i / (cfg.gradient.length - 1), `rgb(${c})`));
        cachedGradient = grad;
    }

    // ── Resize ─────────────────────────────────────────────────────────────────
    function resize() {
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        if (w > 0 && h > 0) {
            canvas.width = w;
            canvas.height = h;
            sized = true;
            if (cfg.worldOffset === 'screen') {
                const rect = canvas.getBoundingClientRect();
                screenOffsetX = rect.left;
                screenOffsetY = rect.top;
            }
            buildGradient();
        }
    }

    // ── Event handlers ─────────────────────────────────────────────────────────
    const onMouseMove = (e) => {
        if (!cfg.trackMouse) return;
        const rect = container.getBoundingClientRect();
        targetMouseX = e.clientX - rect.left;
        targetMouseY = e.clientY - rect.top;
        if (!mouseOn) { mouseX = targetMouseX; mouseY = targetMouseY; }
        mouseOn = true;
    };

    const onTouchMove = (e) => {
        if (!cfg.trackMouse || !e.touches.length) return;
        const rect = container.getBoundingClientRect();
        const t = e.touches[0];
        targetMouseX = t.clientX - rect.left;
        targetMouseY = t.clientY - rect.top;
        if (!mouseOn) { mouseX = targetMouseX; mouseY = targetMouseY; }
        mouseOn = true;
    };

    const onMouseLeave = () => { mouseOn = false; };
    const onTouchEnd   = () => { mouseOn = false; };

    const onScroll = () => {
        if (!cfg.trackScroll) return;
        scrollVel = window.scrollY - prevScrollY;
        prevScrollY = window.scrollY;
    };

    const onResize = () => resize();

    container.addEventListener('mousemove',  onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('touchmove',  onTouchMove,  { passive: true });
    container.addEventListener('touchend',   onTouchEnd);
    window.addEventListener('scroll', onScroll,  { passive: true });
    window.addEventListener('resize', onResize,  { passive: true });
    window.addEventListener('load',   onResize);

    const observer = new IntersectionObserver(
        entries => { visible = entries[0].isIntersecting; },
        { threshold: 0 },
    );
    observer.observe(container);

    resize();

    // ── Noise ──────────────────────────────────────────────────────────────────
    function noiseAngle(x, y, now) {
        let ox = 0, oy = 0;

        if (cfg.worldOffset === 'screen') {
            ox = screenOffsetX;
            oy = screenOffsetY;
        } else if (typeof cfg.worldOffset === 'function') {
            const off = cfg.worldOffset();
            ox = off.x; oy = off.y;
        } else if (cfg.worldOffset) {
            ox = cfg.worldOffset.x;
            oy = cfg.worldOffset.y;
        }

        const wx = x + ox, wy = y + oy;
        return Math.sin(wx * 0.006 + now * 0.22) * 2.1
             + Math.sin(wy * 0.009 - now * 0.17) * 1.7
             + Math.sin((wx - wy) * 0.005 + now * 0.11) * 0.9
             + Math.sin((wx + wy) * 0.004 - now * 0.14) * 0.5;
    }

    // ── Frame loop ─────────────────────────────────────────────────────────────
    function frame() {
        rafId = requestAnimationFrame(frame);

        if (!sized) resize();
        if (!sized || !visible) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mouse lerp → wind velocity from positional delta
        const prevMX = mouseX, prevMY = mouseY;
        if (mouseOn) {
            mouseX += (targetMouseX - mouseX) * cfg.mouseLerp;
            mouseY += (targetMouseY - mouseY) * cfg.mouseLerp;
        }
        windVX += ((mouseX - prevMX) - windVX) * cfg.windLerp;
        windVY += ((mouseY - prevMY) - windVY) * cfg.windLerp;

        mouseIntensity += ((mouseOn ? 1 : 0) - mouseIntensity) * cfg.intensityLerp;
        scrollVel *= 0.87;

        const now         = performance.now() * 0.001;
        const cols        = Math.ceil(canvas.width  / cfg.spacing) + 1;
        const rows        = Math.ceil(canvas.height / cfg.spacing) + 1;
        const scrollDrift = Math.sign(scrollVel) * Math.min(Math.abs(scrollVel) * 0.7, 10);

        const windSpeed   = Math.hypot(windVX, windVY) || 0.001;
        const windDirX    = windVX / windSpeed;
        const windDirY    = windVY / windSpeed;
        const windStrength = Math.min(windSpeed * 3.5, 1) * mouseIntensity;

        const effectStep = cfg.idleStep + (cfg.stepLen - cfg.idleStep) * mouseIntensity;
        const flatAlpha  = cfg.alpha * (1 - mouseIntensity * 0.35);

        const farLines = [], nearLines = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const seedX = c * cfg.spacing, seedY = r * cfg.spacing;
                const seedDist = mouseIntensity > 0.02
                    ? Math.hypot(seedX - mouseX, seedY - mouseY)
                    : 99999;
                const cursorProx = Math.max(0, 1 - seedDist / cfg.windRadius);
                const waveSpeed  = 0.8 + cursorProx * 5.0;
                const waveAmp    = 1.0 + cursorProx * 0.7;

                let px = seedX, py = seedY;
                const pts = [[px, py]];

                for (let step = 0; step < cfg.steps; step++) {
                    const na = noiseAngle(px, py, now);
                    let dirX = Math.cos(na);
                    let dirY = Math.sin(na);

                    if (mouseIntensity > 0.02 && seedDist < cfg.windRadius) {
                        const localDist = Math.hypot(px - mouseX, py - mouseY);
                        const localProx = Math.max(0, 1 - localDist / cfg.windRadius);
                        const blend     = localProx * windStrength;
                        dirX = dirX * (1 - blend) + windDirX * blend;
                        dirY = dirY * (1 - blend) + windDirY * blend;
                        const dl = Math.hypot(dirX, dirY) || 1;
                        dirX /= dl; dirY /= dl;
                    }

                    const wave   = waveAmp * (1 - step / cfg.steps)
                                 * Math.sin(now * waveSpeed + c * 0.63 + r * 1.07)
                                 * mouseIntensity;
                    const driftY = scrollDrift * (1 - mouseIntensity) * 0.5;
                    px += dirX * effectStep + (-dirY) * wave;
                    py += dirY * effectStep +   dirX  * wave + driftY;
                    pts.push([px, py]);
                }

                if (cursorProx > 0.1) nearLines.push(pts);
                else                  farLines.push(pts);
            }
        }

        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';

        if (cachedGradient) {
            ctx.globalAlpha = flatAlpha + 0.12 * mouseIntensity;
            ctx.strokeStyle = cachedGradient;
        } else {
            ctx.strokeStyle = `rgba(${cfg.color},${flatAlpha + 0.12 * mouseIntensity})`;
        }
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        for (const pts of farLines) {
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();

        if (cachedGradient) {
            ctx.globalAlpha = flatAlpha + 0.28 * mouseIntensity;
            ctx.strokeStyle = cachedGradient;
        } else {
            ctx.strokeStyle = `rgba(${cfg.color},${flatAlpha + 0.28 * mouseIntensity})`;
        }
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (const pts of nearLines) {
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();

        if (cachedGradient) ctx.globalAlpha = 1;
    }

    rafId = requestAnimationFrame(frame);

    return {
        /** Live-patch config without restarting the animation. */
        update(patch) {
            Object.assign(cfg, patch);
            if ('gradient' in patch || 'gradientAngle' in patch) buildGradient();
        },

        destroy() {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = null;
            container.removeEventListener('mousemove',  onMouseMove);
            container.removeEventListener('mouseleave', onMouseLeave);
            container.removeEventListener('touchmove',  onTouchMove);
            container.removeEventListener('touchend',   onTouchEnd);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('load',   onResize);
            observer.disconnect();
        },
    };
}

/**
 * Convenience wrapper that creates and injects a <canvas> automatically.
 * The canvas is absolutely positioned to fill the container.
 *
 * @param {HTMLElement}     container
 * @param {NoiseFlowConfig} config
 */
export function mountNoiseFlow(container, config = {}) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';

    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    container.appendChild(canvas);

    const instance = createNoiseFlow(canvas, container, config);

    return {
        canvas,
        update: instance.update,
        destroy() {
            instance.destroy();
            canvas.remove();
        },
    };
}
