import type Phaser from 'phaser';
import { PROP_DEFS, propKey, type PropDef } from '../../data/props';
import type { WorldObject } from '../../maps/model';
import { PROP_ATLAS, PROP_TEXTURE, type PropFrame } from '../../maps/registry';
import { DEPTH, depthForFoot, standLineOf } from '../../systems/depth';

/** Legt die Bildausschnitte des Objekt-Atlas als Frames der geladenen Textur an (einmal je Spiel). */
export function registerPropFrames(textures: Phaser.Textures.TextureManager): void {
  const texture = textures.get(PROP_TEXTURE);
  for (const [name, f] of Object.entries(PROP_ATLAS.frames)) {
    if (!texture.has(name)) texture.add(name, 0, f.x, f.y, f.w, f.h);
  }
}

function frameOf(name: string): PropFrame {
  const frame = PROP_ATLAS.frames[name];
  if (!frame) throw new Error(`Objektbild „${name}“ fehlt im Atlas`);
  return frame;
}

/** Alle Bilder einer Animation müssen gleich groß sein und denselben Fußpunkt haben. */
function checkSameShape(key: string, names: readonly string[]): void {
  const first = frameOf(names[0]!);
  for (const name of names) {
    const f = frameOf(name);
    if (f.w !== first.w || f.h !== first.h || f.anchorX !== first.anchorX || f.anchorY !== first.anchorY) {
      throw new Error(`Animation ${key}: Bild „${name}“ hat eine andere Größe oder einen anderen Fußpunkt`);
    }
  }
}

function animationFor(scene: Phaser.Scene, key: string, def: PropDef): string | null {
  if (!def.frames || def.frames.length < 2) return null;
  const animKey = `prop:${key}`;
  if (!scene.anims.exists(animKey)) {
    checkSameShape(key, def.frames);
    scene.anims.create({
      key: animKey,
      frames: def.frames.map((frame) => ({ key: PROP_TEXTURE, frame })),
      frameRate: def.fps ?? 4,
      repeat: -1,
    });
  }
  return animKey;
}

/**
 * Reihenfolge beim Anlegen: nach Fußpunkt y, dann x, dann Objekt-ID. Gleiche Tiefe behält in Phaser die
 * Reihenfolge des Anlegens (stabile Sortierung); so steht bei gleichem Fußpunkt fest, was vorn liegt.
 */
function drawOrder(a: WorldObject, b: WorldObject): number {
  return a.y - b.y || a.x - b.x || a.id - b.id;
}

/**
 * Zeichnet die Objekte einer Karte. Der Fußpunkt im Bild (anchorX/anchorY) sitzt waagerecht auf dem Fußpunkt
 * des Objekts und senkrecht auf seiner Standlinie standLineOf(y) = Unterkante seiner Kachel (wie im Vorschaubild
 * tools/maps/preview.mjs). Flaches auf DEPTH.flat, Stehendes auf depthForFoot(Standlinie), siehe depth.ts.
 * Liefert die Anzahl der gezeichneten Objekte.
 */
export function buildProps(scene: Phaser.Scene, objects: readonly WorldObject[], tileHeight: number, label: string): number {
  let count = 0;
  for (const o of [...objects].sort(drawOrder)) {
    const key = propKey(o.type, o.variant);
    const def = PROP_DEFS[key];
    if (!def) throw new Error(`Karte ${label}: kein Bild für Objekt ${o.id} (${key})`);
    const f = frameOf(def.frame);
    const standLine = standLineOf(o.y, tileHeight);
    const left = o.x - f.anchorX;
    const top = standLine - f.anchorY;
    if (!Number.isInteger(left) || !Number.isInteger(top)) throw new Error(`Karte ${label}: Objekt ${o.id} liegt nicht auf ganzen Bildpunkten`);
    const sprite = scene.add.sprite(left, top, PROP_TEXTURE, def.frame).setOrigin(0, 0);
    sprite.setDepth(def.layer === 'flat' ? DEPTH.flat : depthForFoot(standLine));
    const anim = animationFor(scene, key, def);
    if (anim) sprite.play(anim);
    count++;
  }
  return count;
}
