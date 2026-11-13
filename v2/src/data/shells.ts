import type { ShellDef } from './types';

export const SHELL_TYPES: Record<string, ShellDef> = {
  shell_common:  { id: 'shell_common',  name: 'Gemeine Muschel',     rarity: 'common',    locations: ['beach'] },
  sand_dollar:   { id: 'sand_dollar',   name: 'Sanddollar',          rarity: 'common',    locations: ['beach'] },
  pearl:         { id: 'pearl',         name: 'Perle',               rarity: 'rare',      locations: ['beach'] },
  starfish_shell:{ id: 'starfish_shell',name: 'Seestern-Muschel',    rarity: 'medium',    locations: ['beach'] },
  coral_piece:   { id: 'coral_piece',   name: 'Korallen-Stück',      rarity: 'medium',    locations: ['beach', 'grotto'] },
  rainbow_shell: { id: 'rainbow_shell', name: 'Regenbogen-Muschel',  rarity: 'very_rare', locations: ['beach'], nightOnly: true },
  spiral_snail:  { id: 'spiral_snail',  name: 'Spiral-Schnecke',     rarity: 'medium',    locations: ['grotto'] },
  deep_crown:    { id: 'deep_crown',    name: 'Tiefseekrone',        rarity: 'very_rare', locations: ['grotto'] },
};
