import type Phaser from 'phaser';
import type { InputHub } from '../input/hub';
import type { PixelGrid } from './pixelGrid';

/** Spielweite Dienste, die `main.ts` vor dem ersten Szenenstart in `game.registry` legt. */
export interface Services {
  pixelGrid: PixelGrid;
  input: InputHub;
}

/** Schlüssel der Dienste in `game.registry`. */
export const SERVICES_KEY = 'services';

/** Liest die spielweiten Dienste aus `game.registry`. */
export function servicesOf(scene: Phaser.Scene): Services {
  const services = scene.game.registry.get(SERVICES_KEY) as Services | undefined;
  if (!services) throw new Error('Spielweite Dienste fehlen in game.registry.');
  return services;
}
