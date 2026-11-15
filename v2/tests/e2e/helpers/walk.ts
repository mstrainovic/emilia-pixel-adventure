import type { Page } from '@playwright/test';

/** Kachelgröße der Karten in Bildpunkten. */
export const TILE = 16;
/** So nah (Bildpunkte, Fußpunkt zur Kachelmitte) gilt eine Kachel als erreicht. */
export const ARRIVE_RADIUS = 6;
/**
 * Je Achse: ist die Abweichung höchstens so groß, wird die Taste dieser Achse losgelassen (und nicht mehr gedrückt,
 * solange es so bleibt). Beide Achsen darin: √(4² + 4²) ≈ 5,7 ≤ ARRIVE_RADIUS. Der Bremsweg nach dem Loslassen
 * (64 px/s, 0,1 s bis zum Stillstand: etwa 3 Bildpunkte) bleibt so meist innerhalb; schießt Emilia doch darüber
 * hinaus, geht es aus dem Stand in kleinen Schritten zurück, ohne Pendeln.
 */
const AXIS_TOLERANCE = 4;

export type PlayerInfo = { x: number; y: number; facing: string; moving: boolean };

/** Fußpunkt und Bewegung der Spielerin über den Test-Zugang (nur lesen). */
export const player = (page: Page): Promise<PlayerInfo> => page.evaluate(() => (window as any).__emilia2.player());

/** Ein gezeichnetes Bild abwarten, dann den Ort lesen (so passt jede Lesung zu einem neuen Bild). */
const playerNextFrame = (page: Page): Promise<PlayerInfo> =>
  page.evaluate(() => new Promise<PlayerInfo>((resolve) => {
    requestAnimationFrame(() => resolve((window as any).__emilia2.player()));
  }));

/**
 * Geht wie ein Kind mit echten Richtungstasten (W/A/S/D), bis der Fußpunkt höchstens ARRIVE_RADIUS Bildpunkte neben
 * der Mitte der Kachel tileX/tileY steht und Emilia stillsteht. Liest den Ort nur über den Test-Zugang und bewegt
 * nie selbst – Wände, Ecken und Tempo wirken wie im Spiel. Gedacht für gerade Strecken ohne Hindernis (der Aufrufer
 * gibt die Wegpunkte vor). Lässt alle Tasten los: am Ziel, bei Zeitüberschreitung und bei jedem Fehler.
 * Wirft nach `timeoutMs` (Wanduhr) mit dem letzten Ort.
 */
export async function walkToTile(page: Page, tileX: number, tileY: number, timeoutMs: number): Promise<PlayerInfo> {
  const target = { x: tileX * TILE + TILE / 2, y: tileY * TILE + TILE / 2 };
  const held = new Set<string>();
  const deadline = Date.now() + timeoutMs;
  try {
    let last = await player(page);
    for (;;) {
      const dx = target.x - last.x;
      const dy = target.y - last.y;
      const want = new Set<string>();
      if (Math.abs(dx) > AXIS_TOLERANCE) want.add(dx > 0 ? 'KeyD' : 'KeyA');
      if (Math.abs(dy) > AXIS_TOLERANCE) want.add(dy > 0 ? 'KeyS' : 'KeyW');
      for (const key of [...held]) {
        if (want.has(key)) continue;
        held.delete(key);
        await page.keyboard.up(key);
      }
      for (const key of want) {
        if (held.has(key)) continue;
        held.add(key);
        await page.keyboard.down(key);
      }
      if (want.size === 0 && !last.moving && Math.hypot(dx, dy) <= ARRIVE_RADIUS) return last;
      if (Date.now() > deadline) {
        throw new Error(
          `walkToTile: Kachel ${tileX}/${tileY} (Mitte ${target.x}/${target.y}) nach ${timeoutMs} ms nicht erreicht; ` +
          `zuletzt bei ${last.x}/${last.y}, ${last.moving ? 'in Bewegung' : 'stehend'}, gedrückt: ${[...held].join(', ') || 'nichts'}`,
        );
      }
      last = await playerNextFrame(page);
    }
  } finally {
    for (const key of held) await page.keyboard.up(key).catch(() => undefined);
  }
}
