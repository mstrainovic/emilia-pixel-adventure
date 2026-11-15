/*
 * Randbilder (kit.css) werden auf einer Ebene in Bildpunkten gezeichnet und mit --hud-scale vergrößert. Scharf ist
 * das nur, wenn das Element auf ganzen Gerätepixeln beginnt und seine Größe ein ganzes Vielfaches von --hud-px ist
 * (sonst fiele die untere oder rechte Kante zwischen zwei Bildpunkte). Elemente mit fester Größe (Knopf, Platz)
 * erfüllen das über ihre Maße; Fenster und Tafeln richten sich nach ihrem Inhalt und werden hier nachgezogen.
 *
 * Chromium rastet die Lage eines Kastens beim Zeichnen je nach Betriebsart auf ganze CSS-Pixel oder auf ganze
 * Gerätepixel ein. Darum gehen Lage und Größe hier auf Werte, die beides sind (bei Dichte 1,25 Vielfache von 4 px,
 * bei 1,5 von 2 px); dann liegt ein rechtsbündiges Element auch links wieder richtig.
 */

/** Kleinstes n in 1…8, für das n × Faktor ganz ist (sonst 1). */
function wholeMultiple(factor: number): number {
  for (let n = 1; n <= 8; n++) if (Math.abs(n * factor - Math.round(n * factor)) < 1e-6) return n;
  return 1;
}

/** --hud-px am Element in CSS-Pixeln (von UiRoot auf #ui gesetzt). */
function hudPx(el: HTMLElement): number {
  const value = parseFloat(getComputedStyle(el).getPropertyValue('--hud-px'));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/**
 * Rundet die Größe des Elements auf (min-width, min-height; box-sizing: border-box): auf ganze Bildpunkte, die
 * zugleich ganze CSS-Pixel sind (--hud-px 1,6 px → Schritte von 8 px).
 */
export function snapSize(el: HTMLElement): void {
  el.style.minWidth = '';
  el.style.minHeight = '';
  const hud = hudPx(el);
  const step = hud * wholeMultiple(hud);
  const box = el.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return;
  // kleine Toleranz: 392 / 1,6 ist in Gleitkomma knapp über 245
  const up = (length: number): string => `${Math.round(Math.ceil(length / step - 1e-3) * step * 1000) / 1000}px`;
  el.style.minWidth = up(box.width);
  el.style.minHeight = up(box.height);
}

/**
 * Hält Elemente mit Randbild in einem Fenster eingerastet (Größe und Lage): jetzt und nach jeder Größenänderung von
 * `container`, dem Fenster oder der Abdunklung darum (dann im folgenden Bild). Nach `WindowManager.open` aufrufen.
 * Das Einrasten der Elemente kann das Fenster vergrößern; darum rastet es danach auch das Fenster selbst wieder ein
 * (wie WindowManager, gleiches Ergebnis) und erst dann die Lage der Elemente. So findet der Beobachter des
 * WindowManager das Fenster schon eingerastet vor und ändert in seinem Rückruf nichts mehr (sonst meldet der Browser
 * „ResizeObserver loop completed with undelivered notifications"). Die Elemente dürfen ihre Breite nicht vom
 * Fenster erben (kein Strecken), sonst wüchse beides mit jedem Einrasten weiter. Liefert das Abmelden.
 */
export function keepSnapped(container: HTMLElement, targets: () => HTMLElement[]): () => void {
  const win = container.closest<HTMLElement>('.ui-window');
  const run = (): void => {
    const list = targets();
    for (const t of list) snapSize(t);
    if (win) {
      snapSize(win);
      snapPosition(win);
    }
    for (const t of list) snapPosition(t);
  };
  run();
  if (typeof ResizeObserver !== 'function') return () => {};
  // erst im nächsten Bild: Einrasten ändert die Größe der Elemente und damit des beobachteten Fensters; direkt im
  // Beobachter gäbe das eine Schleife („ResizeObserver loop completed with undelivered notifications")
  let frame = 0;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(run);
  });
  observer.observe(container);
  // Fenster und Abdunklung wie WindowManager: neue Fenstergröße oder neuer Inhalt verschieben das Fenster
  for (const outer of [win, container.closest<HTMLElement>('.ui-shade')]) {
    if (outer) observer.observe(outer);
  }
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
  };
}

/** Verschiebt das Element (position: relative) auf die nächste Lage, die ganze CSS- und Gerätepixel ist. */
export function snapPosition(el: HTMLElement): void {
  el.style.left = '';
  el.style.top = '';
  const step = wholeMultiple(window.devicePixelRatio || 1);
  const box = el.getBoundingClientRect();
  const shift = (v: number): string => `${Math.round(v / step) * step - v}px`;
  el.style.left = shift(box.left);
  el.style.top = shift(box.top);
}
