// Lightweight canvas-based confetti engine.
// Designed for subtle payment-success celebrations rather than full-screen effects.

export interface ConfettiOptions {
  particleCount?: number;
  origin?: { x: number; y: number };
  spread?: number;
  startVelocity?: number;
  colors?: string[];
  ticks?: number;
  gravity?: number;
  scalar?: number;
  shapes?: ("square" | "circle" | "star")[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: "square" | "circle" | "star";
  size: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  tick: number;
  maxTicks: number;
  gravity: number;
}

const DEFAULT_COLORS = [
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
];

class ConfettiEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;

  private initCanvas(): CanvasRenderingContext2D | null {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return null;
    }

    if (!this.canvas) {
      this.canvas = document.createElement("canvas");

      Object.assign(this.canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "99999",
      });

      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext("2d");

      this.resize();

      window.addEventListener("resize", this.handleResize);
    }

    return this.ctx;
  }

  private handleResize = () => {
    this.resize();
  };

  private resize() {
    if (!this.canvas || !this.ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;

    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;

    // Reset the transform before applying the DPR.
    // Otherwise repeated resize events accumulate scaling.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public fire(options: ConfettiOptions = {}) {
    const ctx = this.initCanvas();

    if (!ctx || !this.canvas) return;

    const count = options.particleCount ?? 40;

    const originX =
      (options.origin?.x ?? 0.5) * window.innerWidth;

    const originY =
      (options.origin?.y ?? 0.35) * window.innerHeight;

    const spread =
      ((options.spread ?? 60) * Math.PI) / 180;

    const startVelocity =
      options.startVelocity ?? 25;

    const colors =
      options.colors ?? DEFAULT_COLORS;

    const maxTicks =
      options.ticks ?? 100;

    const gravity =
      options.gravity ?? 0.9;

    const scalar =
      options.scalar ?? 0.75;

    const shapes =
      options.shapes ?? ["square", "circle"];

    for (let i = 0; i < count; i++) {
      const angle =
        -Math.PI / 2 +
        (Math.random() - 0.5) * spread;

      const speed =
        startVelocity * (0.7 + Math.random() * 0.5);

      const color =
        colors[Math.floor(Math.random() * colors.length)] ??
        DEFAULT_COLORS[0] ??
        "#10b981";

      const shape =
        shapes[Math.floor(Math.random() * shapes.length)] ??
        "square";

      this.particles.push({
        x: originX,
        y: originY,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        color,
        shape,

        size: (4 + Math.random() * 4) * scalar,

        rotation: Math.random() * 360,

        rotationSpeed:
          (Math.random() - 0.5) * 8,

        wobble: Math.random() * 10,

        wobbleSpeed:
          0.08 + Math.random() * 0.06,

        opacity: 1,

        tick: 0,

        maxTicks:
          maxTicks * (0.8 + Math.random() * 0.4),

        gravity,
      });
    }

    if (this.animationFrameId === null) {
      this.loop();
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      if (!particle) continue;

      particle.tick++;

      // Physics
      particle.x += particle.vx;
      particle.y += particle.vy;

      particle.vy += particle.gravity * 0.22;

      particle.vx *= 0.987;
      particle.vy *= 0.987;

      particle.rotation += particle.rotationSpeed;
      particle.wobble += particle.wobbleSpeed;

      // Fade near the end of the particle lifetime.
      if (particle.tick > particle.maxTicks * 0.65) {
        const fadeProgress =
          (particle.tick - particle.maxTicks * 0.65) /
          (particle.maxTicks * 0.35);

        particle.opacity = Math.max(
          0,
          1 - fadeProgress
        );
      }

      const expired =
        particle.tick >= particle.maxTicks ||
        particle.y > window.innerHeight + 50 ||
        particle.opacity <= 0;

      if (expired) {
        this.particles.splice(i, 1);
        continue;
      }

      this.drawParticle(particle);
    }

    if (this.particles.length > 0) {
      this.animationFrameId =
        requestAnimationFrame(this.loop);
    } else {
      this.teardown();
    }
  };

  private drawParticle(particle: Particle) {
    if (!this.ctx) return;

    const ctx = this.ctx;

    ctx.save();

    ctx.translate(
      particle.x,
      particle.y
    );

    ctx.rotate(
      (particle.rotation * Math.PI) / 180
    );

    ctx.scale(
      Math.cos(particle.wobble) * 0.9,
      1
    );

    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;

    if (particle.shape === "circle") {
      ctx.beginPath();

      ctx.arc(
        0,
        0,
        particle.size / 2,
        0,
        Math.PI * 2
      );

      ctx.fill();
    } else if (particle.shape === "star") {
      this.drawStar(
        ctx,
        0,
        0,
        5,
        particle.size * 0.8,
        particle.size * 0.4
      );
    } else {
      ctx.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size * 0.7
      );
    }

    ctx.restore();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) {
    let rotation = (Math.PI / 2) * 3;

    const step = Math.PI / spikes;

    ctx.beginPath();

    ctx.moveTo(
      cx,
      cy - outerRadius
    );

    for (let i = 0; i < spikes; i++) {
      const outerX =
        cx + Math.cos(rotation) * outerRadius;

      const outerY =
        cy + Math.sin(rotation) * outerRadius;

      ctx.lineTo(outerX, outerY);

      rotation += step;

      const innerX =
        cx + Math.cos(rotation) * innerRadius;

      const innerY =
        cy + Math.sin(rotation) * innerRadius;

      ctx.lineTo(innerX, innerY);

      rotation += step;
    }

    ctx.lineTo(
      cx,
      cy - outerRadius
    );

    ctx.closePath();
    ctx.fill();
  }

  /**
   * Small, restrained celebration for successful payment.
   *
   * One burst only.
   * ~45 particles.
   * Short lifetime.
   * Centered above the success message.
   */
public burstCelebration() {
  this.fire({
    particleCount: 190,
    spread: 190,
    origin: {
      x: 0.5,
      y: 0.3,
    },
    startVelocity: 20,
    gravity: 0.9,
    ticks: 95,
    scalar: 0.75,
    shapes: ["square", "circle"],
  });
}

  private teardown() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(
        this.animationFrameId
      );

      this.animationFrameId = null;
    }

    if (this.canvas) {
      window.removeEventListener(
        "resize",
        this.handleResize
      );

      this.canvas.remove();

      this.canvas = null;
      this.ctx = null;
    }
  }
}

export const confetti = new ConfettiEngine();