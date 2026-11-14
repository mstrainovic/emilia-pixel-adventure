import type { MapId } from '../data/maps';
import { FIGURES, FIGURE_SHADOW } from '../data/sprites';
import hubUrl from '../assets/maps/hub.json?url';
import dorfTilesUrl from '../assets/gfx/tiles/dorf.png?url';
import dorfPropsUrl from '../assets/gfx/props/dorf.png?url';
import dorfPropFrames from '../assets/gfx/props/dorf.json';

/*
 * Welche Karten und Bilder das Spiel lädt. Alles über Vite-Importe (?url), damit Basis-Pfad und CSP stimmen.
 * Der Bildpfad im Kachelsatz einer Karte dient nur dem Öffnen in Tiled; das Spiel ordnet das Bild über den
 * Namen des Kachelsatzes zu (TILESET_FILES).
 */

/** Adresse der Kartendatei je Karte; noch nicht neu gestaltete Karten fehlen. */
export const MAP_FILES: Partial<Record<MapId, string>> = { hub: hubUrl };

/** Bild je Kachelsatz-Name (wie in der Karte). */
export const TILESET_FILES: Readonly<Record<string, string>> = { dorf: dorfTilesUrl };

/** Ausschnitt eines Objektbildes im Atlas samt Fußpunkt im Bild. */
export interface PropFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  anchorX: number;
  anchorY: number;
}

/** Atlas der Objektbilder: ein Bild, Bildausschnitte nach Name (manche Namen teilen sich dieselben Pixel). */
export const PROP_ATLAS: { url: string; frames: Readonly<Record<string, PropFrame>> } = {
  url: dorfPropsUrl,
  frames: dorfPropFrames,
};

const figureUrls = import.meta.glob<string>('../assets/gfx/figuren/*.png', { query: '?url', import: 'default', eager: true });

function figureUrl(path: string): string {
  const url = figureUrls[`../assets/gfx/${path}`];
  if (!url) throw new Error(`Figurenbild ${path} fehlt.`);
  return url;
}

/** Figurenblätter (64×80, Zellen 16×16) nach Figur. */
export const FIGURE_FILES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FIGURES).map(([id, def]) => [id, figureUrl(def.sheet)]),
);

/** Schatten unter jeder Figur. */
export const FIGURE_SHADOW_FILE: string = figureUrl(FIGURE_SHADOW);

/** Schlüssel in Phasers Caches. */
export const mapKey = (id: MapId): string => `map:${id}`;
export const tilesetKey = (name: string): string => `tiles:${name}`;
export const PROP_TEXTURE = 'props:dorf';
export const figureKey = (id: string): string => `figure:${id}`;
export const FIGURE_SHADOW_KEY = 'figure:schatten';
