import { snapToScreen } from '../core/pixel';
import { WALK_SPEED } from './movement';

/*
 * Weich folgende Kamera, ohne Phaser. Gerechnet wird mit Gleitkomma (Mittelpunkt des Ausschnitts in
 * Bildpunkten); erst cameraScroll rundet auf die linke obere Ecke, die die Szene setzt.
 */

/** Sekunden bis zur halben Strecke. */
export const CAMERA_HALF_LIFE = 0.12;
/** Bildpunkte Vorausschau in Laufrichtung. */
export const LOOKAHEAD = 12;

/** Mittelpunkt des Ausschnitts in Bildpunkten, Gleitkomma. */
export interface CameraState {
  x: number;
  y: number;
}

type Size = { width: number; height: number };

/**
 * Mittelpunkt auf einer Achse so, dass der Ausschnitt nicht über die Karte schaut. Ist die Karte kleiner als
 * der Ausschnitt, steht sie mittig; die Ecke liegt dann auf einem ganzen Bildpunkt, damit nichts wackelt.
 */
function clampAxis(centre: number, view: number, world: number): number {
  if (world <= view) return Math.floor((world - view) / 2) + view / 2;
  return Math.min(Math.max(centre, view / 2), world - view / 2);
}

/** Vorausschau: in Richtung der Geschwindigkeit, voll ab Gehtempo, beim Anlaufen und Abbremsen anteilig. */
function lookahead(vx: number, vy: number): { x: number; y: number } {
  const speed = Math.hypot(vx, vy);
  if (!Number.isFinite(speed) || speed === 0) return { x: 0, y: 0 };
  const length = LOOKAHEAD * Math.min(1, speed / WALK_SPEED);
  return { x: (vx / speed) * length, y: (vy / speed) * length };
}

/**
 * Ein Zeitschritt: die Kamera legt den Anteil 1 − 0,5^(dt / CAMERA_HALF_LIFE) des Wegs zum Ziel zurück
 * (unabhängig von der Bildrate) und bleibt in der Karte. `dt` = 0 rückt nur in die Karte; ein unbrauchbares
 * `dt` (NaN, negativ, unendlich) oder Ziel lässt die Kamera unverändert.
 */
export function stepCamera(
  cam: CameraState,
  target: { x: number; y: number; vx: number; vy: number },
  dt: number,
  view: Size,
  world: Size,
): CameraState {
  if (!Number.isFinite(dt) || dt < 0) return cam;
  if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) return cam;
  const ahead = lookahead(target.vx, target.vy);
  const share = 1 - 0.5 ** (dt / CAMERA_HALF_LIFE);
  const x = cam.x + (target.x + ahead.x - cam.x) * share;
  const y = cam.y + (target.y + ahead.y - cam.y) * share;
  return { x: clampAxis(x, view.width, world.width), y: clampAxis(y, view.height, world.height) };
}

/**
 * Linke obere Ecke des Ausschnitts, eingerastet auf ganze Bildschirmpixel (Vielfache von 1/`zoom` Bildpunkt;
 * ohne `zoom` auf ganze Bildpunkte). Ganze Bildpunkte als Raster ließen die Welt beim Rennen ruckeln: bei Zoom 6
 * und 112 Bildpunkten je Sekunde rückte sie je Bild mal 12, mal 6 Bildschirmpixel weiter.
 *
 * Mit `anchor` (Fußpunkt der Figur, dieselben Gleitkommawerte, aus denen die Figur gerundet gezeichnet wird)
 * wird die Ecke so gerundet, dass die Figur im Bild dort steht, wo sie aus dem Abstand zur Kamera gerundet
 * hingehört: Ecke = rund(Figur) − rund(Figur − Ecke). Laufen Figur und Kamera gleich schnell, steht die Figur
 * damit ruhig im Bild, statt um einen Bildschirmpixel zu zittern. Die Ecke weicht höchstens einen
 * Bildschirmpixel vom ungerundeten Wert ab; liegt dieser auf einem ganzen Bildpunkt (Kartenrand), gilt er genau.
 */
export function cameraScroll(cam: CameraState, view: Size, anchor?: { x: number; y: number }, zoom = 1): { scrollX: number; scrollY: number } {
  const left = cam.x - view.width / 2;
  const top = cam.y - view.height / 2;
  const snap = (v: number): number => snapToScreen(v, zoom);
  if (!anchor || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) return { scrollX: snap(left), scrollY: snap(top) };
  return {
    scrollX: snap(snap(anchor.x) - snap(anchor.x - left)),
    scrollY: snap(snap(anchor.y) - snap(anchor.y - top)),
  };
}
