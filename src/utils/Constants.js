// Tile & World
export const TILE_SIZE = 16;
export const SCALE = 3;
export const SCALED_TILE = TILE_SIZE * SCALE; // 48px on screen

// Player
export const PLAYER_SPEED = 4; // tiles per second
export const PLAYER_RUN_SPEED = 7;
export const PLAYER_FRAME_W = 64;
export const PLAYER_FRAME_H = 64;

// NPC / Mob sprite base size
export const NPC_FRAME_W = 32;
export const NPC_FRAME_H = 32;

// Camera
export const CAMERA_LERP = 0.08;
export const VISIBLE_TILES_X = 20;
export const VISIBLE_TILES_Y = 14;

// Animation speeds (ms per frame)
export const ANIM_SPEED_IDLE = 180;
export const ANIM_SPEED_WALK = 120;
export const ANIM_SPEED_RUN = 80;

// Hub map
export const HUB_WIDTH = 50;
export const HUB_HEIGHT = 40;

// Z-layers for rendering order
export const Z_GROUND = 0;
export const Z_DECORATION = 0.1;
export const Z_ENTITY_BASE = 0.2;
export const Z_OVERLAY = 10;

// Directions
export const DIR_DOWN = 'down';
export const DIR_UP = 'up';
export const DIR_LEFT = 'left';
export const DIR_RIGHT = 'right';

// Asset base path — uses Vite's base URL for GitHub Pages compatibility
export const BASE_URL = import.meta.env.BASE_URL || '/';
export const ASSET_PATH = `${BASE_URL}Game Assets`;
