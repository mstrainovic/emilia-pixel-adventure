import { FIGURES } from '../data/sprites';

/*
 * Adressen der Bilder der Oberfläche, ohne CSS: Szene und Bausteine können sie nutzen, ohne Stilregeln mitzuladen
 * (sonst hinge die Reihenfolge der Stylesheets an der Importfolge, siehe Bericht Task 7).
 */

/** Gesichter der Dorfbewohner (38×38, von art:build aus dem Faceset der Vorlage). */
const FACE_URLS = import.meta.glob<string>('../assets/gfx/figuren/*-gesicht.png', { query: '?url', import: 'default', eager: true });
/** Bilder aus gfx/ui (Symbole 16×16 aus Items/ des Packs und weitere). */
const ICON_URLS = import.meta.glob<string>('../assets/gfx/ui/*.png', { query: '?url', import: 'default', eager: true });

/** Gesicht eines Dorfbewohners (Aufgabe in der Anzeige, Gesprächsfeld); `null` ohne Figur oder Bild. */
export function faceUrl(npcId: string | undefined): string | null {
  const face = npcId !== undefined ? FIGURES[npcId]?.face : undefined;
  return face !== undefined ? FACE_URLS[`../assets/gfx/${face}`] ?? null : null;
}

/** Adresse eines Bildes aus gfx/ui (Name ohne „.png", etwa aus `iconFor`); wirft, wenn es fehlt. */
export function iconUrl(name: string): string {
  const url = ICON_URLS[`../assets/gfx/ui/${name}.png`];
  if (!url) throw new Error(`Symbol ${name} fehlt in gfx/ui.`);
  return url;
}
