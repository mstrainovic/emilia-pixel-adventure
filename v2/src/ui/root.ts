import type { PixelGrid, PixelGridSnapshot } from '../core/pixelGrid';
import { el } from './el';
import './fonts.css';
import './tokens.css';
import './kit.css';

/**
 * Ein Bildpunkt der Oberflächen-Grafik in Gerätepixeln: halb so groß wie ein Bildpunkt der Welt (aufgerundet), aber
 * nie kleiner als 1,5 CSS-Pixel (`ceil(1,5 × dpr)`, Entscheidung des Auftraggebers zu Task 6): sonst wären Herzen
 * und Symbole auf dem Handy (Zoom 2) nur 8 CSS-Pixel groß. PC und iPad ändert das nicht (1280×720: 2, 1920×1080: 3,
 * iPad quer @2: 4); Handy quer @2: 3 statt 1.
 */
export function hudDevicePixels(zoom: number, dpr: number): number {
  const byZoom = Number.isFinite(zoom) && zoom > 0 ? Math.ceil(zoom / 2) : 1;
  const byDensity = Number.isFinite(dpr) && dpr > 0 ? Math.ceil(1.5 * dpr) : 2;
  return Math.max(1, byZoom, byDensity);
}

/** Maßstab der Oberfläche als CSS-Variablen (Werte mit Einheit `px`). */
export function scaleVariables(snapshot: PixelGridSnapshot): Record<string, string> {
  const { dpr, layout } = snapshot;
  const css = (devicePixels: number): string => `${devicePixels / dpr}px`;
  return {
    '--px': css(1),
    '--hud-px': css(hudDevicePixels(layout.zoom, dpr)),
    // dasselbe als Zahl: Faktor der Randbild-Ebene (kit.css, transform: scale)
    '--hud-scale': String(hudDevicePixels(layout.zoom, dpr) / dpr),
    '--view-x': css(layout.offsetX),
    '--view-y': css(layout.offsetY),
    '--view-w': css(layout.viewWidth * layout.zoom),
    '--view-h': css(layout.viewHeight * layout.zoom),
  };
}

/**
 * Wurzel der HTML-Oberfläche über dem Spielbild. Setzt auf `host` den Maßstab (siehe kit.css) und hält ihn bei jeder
 * neuen Messung des Pixelrasters aktuell; die Bausteine hängen sich in `element` ein.
 * Knöpfe außerhalb von Fenstern geben den Fokus nach dem Auslösen wieder ab – per Zeiger wie per Tastatur (Enter,
 * Leertaste): sonst löste die Leertaste danach den Knopf aus, statt das Spiel zu bedienen (Fix-Welle F15).
 */
export class UiRoot {
  readonly element: HTMLElement;
  private readonly unsubscribe: () => void;

  constructor(private readonly host: HTMLElement, pixelGrid: PixelGrid) {
    this.element = el('div', 'ui-root');
    host.appendChild(this.element);
    this.apply(pixelGrid.snapshot);
    this.unsubscribe = pixelGrid.onChange((snapshot) => this.apply(snapshot));
    this.element.addEventListener('click', this.onClick);
    preloadFonts();
  }

  destroy(): void {
    this.unsubscribe();
    this.element.removeEventListener('click', this.onClick);
    this.element.remove();
    for (const name of this.names) this.host.style.removeProperty(name);
  }

  /** Namen der gesetzten Variablen, für destroy. */
  private names: string[] = [];

  private apply(snapshot: PixelGridSnapshot): void {
    const vars = scaleVariables(snapshot);
    this.names = Object.keys(vars);
    for (const [name, value] of Object.entries(vars)) this.host.style.setProperty(name, value);
  }

  private readonly onClick = (e: MouseEvent): void => {
    const target = e.target as Element | null;
    const button = target?.closest('button');
    if (button && !button.closest('.ui-window')) button.blur();
  };
}

/** Lädt die Schriften gleich beim Start, damit der erste Text nicht in einer Ersatzschrift aufblitzt. */
function preloadFonts(): void {
  const fonts = document.fonts as FontFaceSet | undefined;
  if (!fonts) return;
  for (const font of ['16px Nunito', 'bold 16px Nunito', '16px EmiliaZahlen']) {
    fonts.load(font, font.includes('Zahlen') ? '0123456789' : undefined).catch(() => undefined);
  }
}
