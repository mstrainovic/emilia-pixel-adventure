import type Phaser from 'phaser';
import { computeLayout, type PixelLayout } from './pixel';

/** Gemessener Zustand der Zeichenfläche. */
export interface PixelGridSnapshot {
  deviceWidth: number;
  deviceHeight: number;
  dpr: number;
  layout: PixelLayout;
}

type MeasuredEntry = Pick<ResizeObserverEntry, 'devicePixelContentBoxSize' | 'contentRect'>;
type Listener = (snapshot: PixelGridSnapshot) => void;

/**
 * Gerätepixel aus einer ResizeObserver-Messung. Liefert der Browser `devicePixelContentBoxSize`,
 * gilt dieser Wert unverändert; sonst (Safari) CSS-Größe × Pixeldichte, gerundet. Mindestens 1.
 * Weicht die Gerätepixel-Messung um mehr als einen Pixel von CSS-Größe × Pixeldichte ab, ist sie
 * unbrauchbar (Chromium meldet bei emulierter Pixeldichte die CSS-Größe) und die Rechnung gilt.
 */
export function measureDevicePixels(entry: MeasuredEntry, dpr: number): { deviceWidth: number; deviceHeight: number } {
  const ratio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  const cssWidth = entry.contentRect.width * ratio;
  const cssHeight = entry.contentRect.height * ratio;
  const box = entry.devicePixelContentBoxSize?.[0];
  if (box && Math.abs(box.inlineSize - cssWidth) <= 1 && Math.abs(box.blockSize - cssHeight) <= 1) {
    return { deviceWidth: Math.max(1, Math.round(box.inlineSize)), deviceHeight: Math.max(1, Math.round(box.blockSize)) };
  }
  return { deviceWidth: Math.max(1, Math.round(cssWidth)), deviceHeight: Math.max(1, Math.round(cssHeight)) };
}

function currentDpr(): number {
  const dpr = window.devicePixelRatio;
  return Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
}

function snapshotOf(deviceWidth: number, deviceHeight: number, dpr: number): PixelGridSnapshot {
  return { deviceWidth, deviceHeight, dpr, layout: computeLayout(deviceWidth, deviceHeight) };
}

/**
 * Spielweites Pixelraster: misst die Gerätepixel des Spielbereichs, macht die Zeichenfläche genau so
 * groß und teilt sie in ganzzahlig gezoomte Bildpunkte auf. Szenen richten ihre Kamera mit `applyTo` aus.
 */
export class PixelGrid {
  private readonly listeners = new Set<Listener>();
  private current: PixelGridSnapshot = snapshotOf(1, 1, 1);
  private observer: ResizeObserver | null = null;
  private resolutionQuery: MediaQueryList | null = null;
  private running = false;

  constructor(
    private readonly game: Phaser.Game,
    private readonly host: HTMLElement,
  ) {}

  /** Beginnt zu messen, sobald die Zeichenfläche existiert. */
  start(): void {
    if (this.running) return;
    this.running = true;
    // Fährt das Spiel noch hoch, setzt der Scale Manager dabei seine Startgröße; erst danach messen.
    if (this.game.isBooted) this.begin();
    else this.game.events.once('boot', this.deferBegin, this);
  }

  stop(): void {
    this.running = false;
    this.game.events.off('boot', this.deferBegin, this);
    this.observer?.disconnect();
    this.observer = null;
    this.resolutionQuery?.removeEventListener('change', this.onResolutionChange);
    this.resolutionQuery = null;
  }

  get snapshot(): PixelGridSnapshot {
    return this.current;
  }

  /** Meldet jede neue Messung; liefert die Abmeldung zurück. */
  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Kamera-Ausschnitt auf ein Vielfaches des Zooms, eingerückt um den Rand; Zoom ganzzahlig. */
  applyTo(camera: Phaser.Cameras.Scene2D.Camera): void {
    const { zoom, viewWidth, viewHeight, offsetX, offsetY } = this.current.layout;
    camera.setViewport(offsetX, offsetY, viewWidth * zoom, viewHeight * zoom);
    camera.setZoom(zoom);
  }

  /** Ort im sichtbaren Feld, in Bildpunkten, für eine Zeigerposition in CSS-Pixeln. */
  cssToView(cssX: number, cssY: number): { x: number; y: number } {
    const { zoom, offsetX, offsetY } = this.current.layout;
    const scale = this.game.scale;
    return {
      x: (scale.transformX(cssX) - offsetX) / zoom,
      y: (scale.transformY(cssY) - offsetY) / zoom,
    };
  }

  private deferBegin(): void {
    // Erst nach dem übrigen Hochfahren (Scale Manager) messen.
    queueMicrotask(() => this.begin());
  }

  private begin(): void {
    if (!this.running) return;
    // Vorläufig aus der CSS-Größe, bis der Beobachter seine erste Messung liefert.
    const rect = this.host.getBoundingClientRect();
    this.apply(measureDevicePixels({ devicePixelContentBoxSize: [], contentRect: rect }, currentDpr()));
    this.observe();
    this.watchResolution();
  }

  private observe(): void {
    this.observer?.disconnect();
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry && this.running) this.apply(measureDevicePixels(entry, currentDpr()));
    });
    try {
      observer.observe(this.host, { box: 'device-pixel-content-box' });
    } catch {
      // Safari kennt die Gerätepixel-Messung nicht: CSS-Größe beobachten, Gerätepixel runden.
      observer.observe(this.host);
    }
    this.observer = observer;
  }

  /** Ändert sich die Pixeldichte (anderer Bildschirm, Browser-Zoom), wird neu gemessen. */
  private watchResolution(): void {
    this.resolutionQuery?.removeEventListener('change', this.onResolutionChange);
    this.resolutionQuery = window.matchMedia(`(resolution: ${currentDpr()}dppx)`);
    this.resolutionQuery.addEventListener('change', this.onResolutionChange);
  }

  private readonly onResolutionChange = (): void => {
    if (!this.running) return;
    this.watchResolution();
    // Neu beobachten löst sofort eine frische Messung aus.
    this.observe();
  };

  private apply(size: { deviceWidth: number; deviceHeight: number }): void {
    const dpr = currentDpr();
    const { deviceWidth, deviceHeight } = size;
    const prev = this.current;
    if (prev.deviceWidth === deviceWidth && prev.deviceHeight === deviceHeight && prev.dpr === dpr) return;
    const canvas = this.game.canvas;
    // CSS-Größe zuerst: der Scale Manager liest sie beim Größenwechsel für die Zeigerabbildung.
    canvas.style.width = `${deviceWidth / dpr}px`;
    canvas.style.height = `${deviceHeight / dpr}px`;
    // Zeichenfläche, Renderer und Kameras auf die gemessenen Gerätepixel
    this.game.scale.resize(deviceWidth, deviceHeight);
    this.current = snapshotOf(deviceWidth, deviceHeight, dpr);
    for (const listener of [...this.listeners]) listener(this.current);
  }
}
