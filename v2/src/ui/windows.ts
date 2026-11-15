import type { EventBus, GameEvents } from '../core/events';
import { TEXTS } from '../data/texts';
import type { InputHub } from '../input/hub';
import { el } from './el';
import { snapPosition, snapSize } from './grid';

export interface WindowSpec {
  /** Kennung des Fensters (steht als `data-window` am Fenster, nie im Bild). */
  id: string;
  title: string;
  body: HTMLElement;
  /** Läuft nach dem Schließen, auch wenn ein anderes Fenster dieses ersetzt. */
  onClose?: () => void;
  /**
   * `buttons` (Fragen und Hinweise zum Speichern, Fix-Welle F6): Tippen daneben schließt nicht, und der Fokus liegt
   * beim Öffnen auf dem Titel statt auf × – so beantwortet weder ein Danebentippen noch die Leertaste etwas. × und Esc
   * schließen weiter (`onClose` entscheidet, was das heißt). Ohne Angabe: `any`.
   */
  dismiss?: 'any' | 'buttons';
}

/** Dauer der Blende in ms (wie --fade in tokens.css). */
const FADE_MS = 120;
/** Grund, unter dem ein offenes Fenster das Spiel anhält. */
const WINDOW_REASON = 'window';

interface OpenWindow {
  spec: WindowSpec;
  shade: HTMLElement;
  /** Fokus vor dem ersten Fenster; kehrt beim Schließen dorthin zurück. */
  previousFocus: HTMLElement | null;
  /** Beendet das Einrasten (Beobachter und ein noch geplantes Bild). */
  release: () => void;
}

/**
 * Das Fenster richtet sich nach seinem Inhalt und steht mittig: Größe auf ganze Bildpunkte, Lage auf ganze
 * Gerätepixel (grid.ts), sonst wird sein Randbild unscharf. Jetzt und wieder, sobald sich Fenster oder Abdunklung
 * (Fenstergröße, Inhalt, Schrift geladen) ändern.
 */
function snap(win: HTMLElement): void {
  snapSize(win);
  snapPosition(win);
}

function keepSnapped(win: HTMLElement, shade: HTMLElement): () => void {
  snap(win);
  if (typeof ResizeObserver !== 'function') return () => {};
  // erst im nächsten Bild: Einrasten ändert die Größe des beobachteten Fensters; direkt im Beobachter meldet der
  // Browser sonst „ResizeObserver loop completed with undelivered notifications" (etwa wenn beim Start ein Fenster
  // offen ist und die Schrift nachlädt, Task 9)
  let frame = 0;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => snap(win));
  });
  observer.observe(win);
  observer.observe(shade);
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
  };
}

/** Was im Fenster per Tab erreichbar ist, in Dokumentreihenfolge. */
function tabStops(win: HTMLElement): HTMLElement[] {
  return Array.from(win.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]'))
    .filter((n) => n.tabIndex >= 0 && !n.hasAttribute('disabled'));
}

/** Tab und Umschalt+Tab kreisen im Fenster (Fix-Welle F15): nach dem letzten kommt der erste und umgekehrt. */
function cycleTab(win: HTMLElement, e: KeyboardEvent): void {
  if (e.key !== 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return;
  const stops = tabStops(win);
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (!first || !last) {
    e.preventDefault();
    return;
  }
  const active = document.activeElement;
  const inside = stops.includes(active as HTMLElement);
  if (e.shiftKey && (active === first || !inside)) {
    e.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!e.shiftKey && (active === last || !inside)) {
    e.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function reducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fenster-Verwalter (Spec 10): ein Fenster zur Zeit, ein zweites ersetzt das erste. Ein Fenster schließt mit ×, Esc
 * (Handlung `cancel`) und Tippen daneben (nicht bei `dismiss: 'buttons'`), hält das Spiel an (`ui:paused`), blendet
 * 120 ms ein und aus (ohne Blende bei `prefers-reduced-motion`), meldet `ui:sound`. Der Fokus liegt beim Öffnen auf ×
 * (bei `dismiss: 'buttons'` auf dem Titel), Tab kreist im Fenster, danach kehrt der Fokus zurück – aber nicht auf einen
 * Knopf der Anzeige (die geben den Fokus ans Spiel ab, root.ts). Solange ein Fenster offen ist, sind die übrigen Kinder
 * von `root` `inert` (weder Tab noch Zeiger).
 * Auch Gespräch und Dreh-Hinweis halten das Spiel über `setPaused` an; angehalten ist es, solange ein Grund besteht.
 */
export class WindowManager {
  private current: OpenWindow | null = null;
  private readonly closing = new Set<HTMLElement>();
  private readonly reasons = new Set<string>();
  /** Was der Verwalter für die Dauer eines Fensters unerreichbar gemacht hat (`inert`), um es danach freizugeben. */
  private readonly madeInert = new Set<HTMLElement>();

  /**
   * `input` wird beim Öffnen sofort losgelassen (`reset`), damit keine Taste klebt. Sofort, nicht erst im nächsten
   * `handleInput`: sonst ginge ein Druck verloren, der zwischen Öffnen und nächstem Bild kommt (etwa Esc).
   */
  constructor(private readonly root: HTMLElement, private readonly bus: EventBus<GameEvents>, private readonly input: InputHub) {}

  open(spec: WindowSpec): void {
    const replaced = this.current;
    const previousFocus = replaced ? replaced.previousFocus : this.focusToRestore();
    if (replaced) {
      this.current = null;
      replaced.release();
      replaced.shade.remove();
    }
    for (const shade of this.closing) shade.remove();
    this.closing.clear();

    const shade = el('div', 'ui-shade');
    const win = el('section', 'ui-window');
    win.dataset.window = spec.id;
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-modal', 'true');
    const head = el('div', 'ui-window__head');
    const title = el('h2', 'ui-window__title', spec.title);
    title.id = `ui-window-title-${spec.id}`;
    win.setAttribute('aria-labelledby', title.id);
    const close = el('button', 'ui-button ui-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', TEXTS['window.close']);
    close.addEventListener('click', () => this.closeIf(shade));
    const body = el('div', 'ui-window__body');
    body.appendChild(spec.body);
    head.append(title, close);
    win.append(head, body);
    shade.appendChild(win);
    // Tippen daneben: nur ein Klick genau auf die Abdunklung, nicht ins Fenster – und nie bei Fragen
    const buttonsOnly = spec.dismiss === 'buttons';
    if (!buttonsOnly) shade.addEventListener('click', (e) => { if (e.target === shade) this.closeIf(shade); });
    win.addEventListener('keydown', (e) => cycleTab(win, e));
    this.root.appendChild(shade);
    this.makeOthersInert(shade);

    this.current = { spec, shade, previousFocus, release: keepSnapped(win, shade) };
    // Blende: erst nach dem ersten Layout sichtbar schalten, sonst springt der Übergang
    void shade.offsetWidth;
    shade.classList.add('is-open');
    if (buttonsOnly) {
      // Titel: nimmt den Fokus an, liegt aber nicht in der Tab-Reihenfolge; Leertaste und Enter lösen dort nichts aus
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    } else {
      close.focus({ preventScroll: true });
    }
    this.input.reset();
    if (replaced) replaced.spec.onClose?.();
    this.setPaused(WINDOW_REASON, true);
    this.bus.emit('ui:sound', { name: 'open' });
  }

  close(): void {
    const open = this.current;
    if (!open) return;
    this.current = null;
    open.release();
    const { shade } = open;
    shade.classList.remove('is-open');
    shade.classList.add('is-closing');
    if (reducedMotion()) {
      shade.remove();
    } else {
      this.closing.add(shade);
      window.setTimeout(() => {
        this.closing.delete(shade);
        shade.remove();
      }, FADE_MS);
    }
    // erst freigeben, dann den Fokus zurückgeben: ein Element mit inert nimmt keinen Fokus an
    for (const node of this.madeInert) node.inert = false;
    this.madeInert.clear();
    restoreFocus(open.previousFocus, shade);
    this.setPaused(WINDOW_REASON, false);
    this.bus.emit('ui:sound', { name: 'close' });
    open.spec.onClose?.();
  }

  get openId(): string | null {
    return this.current?.spec.id ?? null;
  }

  setPaused(reason: string, paused: boolean): void {
    const before = this.paused;
    if (paused) this.reasons.add(reason);
    else this.reasons.delete(reason);
    if (this.paused !== before) this.bus.emit('ui:paused', { paused: this.paused });
  }

  get paused(): boolean {
    return this.reasons.size > 0;
  }

  /**
   * Schritt 2 der Reihenfolge je Bild (WorldScene.update): nimmt `cancel` ab, wenn ein Fenster offen ist (schließt
   * es). Liefert `true`, wenn ein Druck abgenommen wurde.
   */
  handleInput(input: InputHub): boolean {
    if (this.current && input.consume('cancel')) {
      this.close();
      return true;
    }
    return false;
  }

  /**
   * Alles andere in der Oberfläche (Anzeige, Schnellleiste, Touch-Knöpfe) ist bei offenem Fenster weder per Tab noch
   * per Zeiger erreichbar. Was schon vorher `inert` war, bleibt unberührt und wird später nicht freigegeben.
   */
  private makeOthersInert(shade: HTMLElement): void {
    for (const child of Array.from(this.root.children)) {
      if (child === shade || !(child instanceof HTMLElement) || child.inert) continue;
      child.inert = true;
      this.madeInert.add(child);
    }
  }

  /**
   * Wohin der Fokus nach dem Fenster zurückkehrt: wo er jetzt ist – außer auf einem Knopf der Oberfläche außerhalb
   * eines Fensters (Menü-Knopf, Platz): der gäbe den Fokus ans Spiel ab, die Leertaste löste ihn sonst wieder aus.
   */
  private focusToRestore(): HTMLElement | null {
    const active = focusedElement();
    if (active && this.root.contains(active) && active.closest('button') && !active.closest('.ui-window')) return null;
    return active;
  }

  /** Schließt nur, wenn `shade` noch das offene Fenster ist (ein später Klick auf ein ersetztes bleibt ohne Folgen). */
  private closeIf(shade: HTMLElement): void {
    if (this.current?.shade === shade) this.close();
  }
}

function focusedElement(): HTMLElement | null {
  const active = document.activeElement;
  return active instanceof HTMLElement && active !== document.body ? active : null;
}

/** Fokus zurück, wo er vor dem Fenster war; sonst aus dem Fenster nehmen. */
function restoreFocus(previous: HTMLElement | null, shade: HTMLElement): void {
  if (previous && previous.isConnected) {
    previous.focus({ preventScroll: true });
    return;
  }
  const active = document.activeElement;
  if (active instanceof HTMLElement && shade.contains(active)) active.blur();
}
