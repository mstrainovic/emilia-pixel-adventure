import * as THREE from 'three';

/**
 * Loads real pixel-art tiles from Cute_Fantasy and Farm RPG asset packs,
 * compositing them into a single tileset texture strip.
 *
 * Tile IDs (same as before, backward-compatible with all maps):
 *   0 = grass dark       (Cute_Fantasy Grass_Middle darkened)
 *   1 = grass medium     (Cute_Fantasy Grass_Middle)
 *   2 = grass light      (Cute_Fantasy Grass_Middle brightened)
 *   3 = grass variant    (Cute_Fantasy Grass_Middle hue-shifted)
 *   4 = dirt path        (Cute_Fantasy Path_Tile center — cobblestone texture)
 *   5 = dirt dark        (Cute_Fantasy Path_Tile center, darkened)
 *   6 = wood floor       (Farm RPG — extracted from House.png floor plank)
 *   7 = wood floor light (Farm RPG — lighter variant)
 *   8 = flower grass     (Grass + flowers from Cute_Fantasy Outdoor_Decor)
 *   9 = stone floor      (Cute_Fantasy Cliff edge tile, grey stone)
 *  10 = water            (Cute_Fantasy Water_Middle.png)
 *  11-13 = sand variants (Beach_Tile.png center + procedural)
 *  14 = pier wood
 *  15-18 = underwater variants
 *  19-22 = cloud/crystal variants
 *  23-34 = water auto-tile edges (from Water_Tile.png)
 *  35-46 = path auto-tile edges (from Path_Tile.png)
 */

const T = 16;
const TILE_COUNT = 47;

/**
 * Loads an image and returns a promise.
 */
function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/**
 * Tint a 16x16 region by multiplying each pixel's RGB.
 */
function tintRegion(ctx, ox, oy, rMul, gMul, bMul) {
  const imgData = ctx.getImageData(ox, oy, T, T);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.min(255, Math.round(d[i] * rMul));
    d[i + 1] = Math.min(255, Math.round(d[i + 1] * gMul));
    d[i + 2] = Math.min(255, Math.round(d[i + 2] * bMul));
  }
  ctx.putImageData(imgData, ox, oy);
}

/**
 * Draw detailed flowers on top of a grass tile (for tile 8).
 * Uses cross-shaped petals with stems and bright centers.
 */
function addFlowers(ctx, ox, oy) {
  const flowers = [
    { x: 3,  y: 3,  c: '#ff6080' },  // pink
    { x: 10, y: 2,  c: '#ffc040' },  // yellow
    { x: 6,  y: 7,  c: '#ff60ff' },  // magenta
    { x: 13, y: 5,  c: '#80a0ff' },  // blue
    { x: 2,  y: 11, c: '#ff9050' },  // orange
    { x: 8,  y: 12, c: '#c080ff' },  // purple
    { x: 12, y: 10, c: '#ffff60' },  // bright yellow
  ];

  for (const f of flowers) {
    // Stem
    ctx.fillStyle = '#2a6620';
    ctx.fillRect(ox + f.x, oy + f.y + 1, 1, 2);

    // Flower petals (cross shape)
    ctx.fillStyle = f.c;
    ctx.fillRect(ox + f.x,     oy + f.y,     1, 1); // center
    ctx.fillRect(ox + f.x - 1, oy + f.y,     1, 1); // left
    ctx.fillRect(ox + f.x + 1, oy + f.y,     1, 1); // right
    ctx.fillRect(ox + f.x,     oy + f.y - 1, 1, 1); // top

    // Bright center dot
    ctx.fillStyle = '#ffe080';
    ctx.fillRect(ox + f.x, oy + f.y, 1, 1);
  }
}

/**
 * Draw a simple wood plank tile (for tile 6/7).
 */
function drawWoodTile(ctx, ox, oy, light) {
  const base = light ? [175, 142, 88] : [145, 115, 68];
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(ox, oy, T, T);
  // Plank lines
  ctx.fillStyle = `rgba(0,0,0,0.15)`;
  for (let y = 0; y < T; y += 4) ctx.fillRect(ox, oy + y, T, 1);
  // Grain
  ctx.fillStyle = `rgba(${base[0] - 20},${base[1] - 20},${base[2] - 15},0.25)`;
  for (let y = 1; y < T; y += 3) ctx.fillRect(ox + 1, oy + y, 10, 1);
  // Highlight
  ctx.fillStyle = `rgba(255,255,255,0.08)`;
  ctx.fillRect(ox + 2, oy + 2, 6, 1);
  ctx.fillRect(ox + 2, oy + 6, 8, 1);
}

/**
 * Draw a detailed stone floor tile (for tile 9 — dungeon).
 * Individual stone blocks with deep mortar lines and 3D highlights.
 */
function drawStoneTile(ctx, ox, oy) {
  // Base stone color
  ctx.fillStyle = '#787B88';
  ctx.fillRect(ox, oy, T, T);

  // Individual stone blocks with different shades
  ctx.fillStyle = '#7E8190';
  ctx.fillRect(ox + 1, oy + 1, 6, 6);   // top-left stone
  ctx.fillStyle = '#747786';
  ctx.fillRect(ox + 9, oy + 1, 5, 6);   // top-right stone
  ctx.fillStyle = '#7A7D8C';
  ctx.fillRect(ox + 1, oy + 9, 7, 5);   // bottom-left stone
  ctx.fillStyle = '#808394';
  ctx.fillRect(ox + 10, oy + 9, 4, 5);  // bottom-right stone

  // Deep mortar lines (dark shadows)
  ctx.fillStyle = '#4A4D5A';
  ctx.fillRect(ox,      oy + 7, T, 1);  // horizontal mortar
  ctx.fillRect(ox + 7,  oy,     1, 8);  // vertical mortar top
  ctx.fillRect(ox + 9,  oy + 8, 1, 8);  // vertical mortar bottom

  // Light edge highlights on stones (top-left of each stone for 3D look)
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(ox + 1,  oy + 1, 6, 1);  // top-left stone top edge
  ctx.fillRect(ox + 9,  oy + 1, 5, 1);  // top-right stone top edge
  ctx.fillRect(ox + 1,  oy + 9, 7, 1);  // bottom-left stone top edge
  ctx.fillRect(ox + 10, oy + 9, 4, 1);  // bottom-right stone top edge

  // Dark bottom edge of each stone (depth)
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(ox + 1,  oy + 6,  6, 1);
  ctx.fillRect(ox + 9,  oy + 6,  5, 1);
  ctx.fillRect(ox + 1,  oy + 13, 7, 1);
  ctx.fillRect(ox + 10, oy + 13, 4, 1);

  // Tiny moss spots for life
  ctx.fillStyle = 'rgba(60,100,50,0.15)';
  ctx.fillRect(ox + 2,  oy + 5,  2, 1);
  ctx.fillRect(ox + 12, oy + 12, 1, 1);
}

/**
 * Add subtle pixel-art detail to a grass tile region.
 * Uses a seeded RNG so the pattern is always consistent.
 */
function addGrassDetail(ctx, ox, oy, seed) {
  let s = seed;
  const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  // Small grass tufts (darker green streaks)
  ctx.fillStyle = 'rgba(0,50,0,0.12)';
  for (let i = 0; i < 3; i++) {
    const gx = Math.floor(rng() * 14);
    const gy = Math.floor(rng() * 14);
    ctx.fillRect(ox + gx, oy + gy, 2, 1);
  }

  // Tiny light highlights
  ctx.fillStyle = 'rgba(255,255,200,0.08)';
  for (let i = 0; i < 2; i++) {
    const lx = Math.floor(rng() * 14) + 1;
    const ly = Math.floor(rng() * 14) + 1;
    ctx.fillRect(ox + lx, oy + ly, 1, 1);
  }

  // Small pebble (very subtle, ~50% chance per tile)
  if (rng() > 0.5) {
    ctx.fillStyle = 'rgba(120,110,90,0.15)';
    const px = Math.floor(rng() * 12) + 2;
    const py = Math.floor(rng() * 12) + 2;
    ctx.fillRect(ox + px, oy + py, 2, 1);
  }
}

function _addSandGrain(ctx, offsetX, color, count) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = offsetX + Math.random() * 16;
    const y = Math.random() * 16;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
}

function _addShellFragments(ctx, offsetX) {
  ctx.fillStyle = '#FFCCDD';
  ctx.fillRect(offsetX + 3, 5, 2, 1);
  ctx.fillRect(offsetX + 10, 11, 2, 1);
  ctx.fillStyle = '#FDEEF4';
  ctx.fillRect(offsetX + 7, 8, 1, 1);
}

function _addWoodGrain(ctx, offsetX) {
  ctx.fillStyle = '#7D6340';
  for (let y = 0; y < 16; y += 4) {
    ctx.fillRect(offsetX, y, 16, 1);
  }
  ctx.fillStyle = '#9A7D55';
  ctx.fillRect(offsetX + 3, 0, 1, 16);
  ctx.fillRect(offsetX + 11, 0, 1, 16);
}

/**
 * Async: Load real tiles from asset packs and composite into a strip.
 */
export async function generateTilesetAsync() {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_COUNT * T;
  canvas.height = T;
  const ctx = canvas.getContext('2d');

  try {
    // Load source images
    const base = import.meta.env.BASE_URL || '/';
    const [grassImg, pathImg, waterImg, pathTileImg, waterTileImg, beachTileImg] = await Promise.all([
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Grass_Middle.png`),
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Path_Middle.png`),
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Water_Middle.png`),
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Path_Tile.png`),
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Water_Tile.png`),
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Beach_Tile.png`),
    ]);

    // Tile 1: grass medium (source image as-is)
    ctx.drawImage(grassImg, 0, 0, T, T, 1 * T, 0, T, T);
    addGrassDetail(ctx, 1 * T, 0, 200);

    // Tile 0: grass dark (very subtly darker for gentle variation)
    ctx.drawImage(grassImg, 0, 0, T, T, 0 * T, 0, T, T);
    tintRegion(ctx, 0, 0, 0.95, 0.96, 0.94);
    addGrassDetail(ctx, 0 * T, 0, 100);

    // Tile 2: grass light (very subtly brighter for gentle variation)
    ctx.drawImage(grassImg, 0, 0, T, T, 2 * T, 0, T, T);
    tintRegion(ctx, 2 * T, 0, 1.03, 1.03, 1.01);
    addGrassDetail(ctx, 2 * T, 0, 300);

    // Tile 3: grass variant (very subtle hue shift for gentle variation)
    ctx.drawImage(grassImg, 0, 0, T, T, 3 * T, 0, T, T);
    tintRegion(ctx, 3 * T, 0, 0.99, 1.02, 0.97);
    addGrassDetail(ctx, 3 * T, 0, 400);

    // Tile 4: dirt path — center tile from Path_Tile.png auto-tile set (16,16)
    // provides cobblestone texture with real depth vs. the flat Path_Middle.png
    ctx.drawImage(pathTileImg, T, T, T, T, 4 * T, 0, T, T);

    // Tile 5: dirt dark — same center tile, darkened
    ctx.drawImage(pathTileImg, T, T, T, T, 5 * T, 0, T, T);
    tintRegion(ctx, 5 * T, 0, 0.8, 0.78, 0.75);

    // Tile 6: wood floor (canvas-drawn to match style)
    drawWoodTile(ctx, 6 * T, 0, false);

    // Tile 7: wood floor light
    drawWoodTile(ctx, 7 * T, 0, true);

    // Tile 8: flower grass (grass + hand-placed flowers)
    ctx.drawImage(grassImg, 0, 0, T, T, 8 * T, 0, T, T);
    tintRegion(ctx, 8 * T, 0, 1.05, 1.1, 0.95);
    addFlowers(ctx, 8 * T, 0);

    // Tile 9: stone floor (for dungeon)
    drawStoneTile(ctx, 9 * T, 0);

    // Tile 10: water (from Cute_Fantasy Water_Middle.png)
    ctx.drawImage(waterImg, 0, 0, T, T, 10 * T, 0, T, T);

    // 11 = sand_light — real sand from Beach_Tile.png center (1,1)
    ctx.drawImage(beachTileImg, T, T, T, T, 11 * T, 0, T, T);

    // 12 = sand_dark — wet/dark sand near water
    ctx.fillStyle = '#C4A97D';
    ctx.fillRect(12 * T, 0, T, T);
    _addSandGrain(ctx, 12 * T, '#B89B6D', 10);

    // 13 = sand_shells — sand with shell fragments
    ctx.fillStyle = '#F0D9A8';
    ctx.fillRect(13 * T, 0, T, T);
    _addSandGrain(ctx, 13 * T, '#E0C998', 6);
    _addShellFragments(ctx, 13 * T);

    // 14 = pier_wood — wooden planks
    ctx.fillStyle = '#8B6F47';
    ctx.fillRect(14 * T, 0, T, T);
    _addWoodGrain(ctx, 14 * T);

    // 15 = underwater_dark — dark blue stone (cave walls)
    ctx.fillStyle = '#3A5A7A';
    ctx.fillRect(15 * T, 0, T, T);
    // Stone cracks
    ctx.fillStyle = '#2E4E6A';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(15 * T + (i * 5 % 14), (i * 7 % 14), 3, 1);
    }
    // Subtle highlight for depth
    ctx.fillStyle = 'rgba(100,180,220,0.08)';
    ctx.fillRect(15 * T + 2, 2, 4, 3);
    ctx.fillRect(15 * T + 9, 8, 5, 3);

    // 16 = underwater_blue — blue-grey stone (walkable floor)
    ctx.fillStyle = '#4A7A9A';
    ctx.fillRect(16 * T, 0, T, T);
    ctx.fillStyle = '#3E6E8A';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(16 * T + (i * 5 % 14), (i * 7 % 14), 3, 1);
    }
    // Water shimmer highlights
    ctx.fillStyle = 'rgba(120,200,240,0.10)';
    ctx.fillRect(16 * T + 3, 4, 3, 1);
    ctx.fillRect(16 * T + 10, 9, 4, 1);

    // 17 = underwater_moss — moss-covered stone
    ctx.fillStyle = '#3A7A5A';
    ctx.fillRect(17 * T, 0, T, T);
    ctx.fillStyle = '#2E6A4E';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(17 * T + (i * 5 % 14), (i * 7 % 14), 3, 1);
    }
    // Moss dots (brighter)
    ctx.fillStyle = '#4A9A6A';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(17 * T + (i * 3 % 14), (i * 5 % 14), 2, 2);
    }
    // Bioluminescent glow spots
    ctx.fillStyle = 'rgba(100,255,180,0.12)';
    ctx.fillRect(17 * T + 5, 6, 2, 2);
    ctx.fillRect(17 * T + 11, 3, 2, 1);

    // 18 = underwater_sand — wet underwater sand
    ctx.fillStyle = '#7A8A7A';
    ctx.fillRect(18 * T, 0, T, T);
    ctx.fillStyle = '#6A7A6A';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(18 * T + (i * 3 % 14), (i * 4 % 14), 1, 1);
    }
    // Sand ripple highlights
    ctx.fillStyle = 'rgba(160,200,180,0.10)';
    ctx.fillRect(18 * T + 2, 5, 6, 1);
    ctx.fillRect(18 * T + 7, 11, 5, 1);

    // 19 = cloud_white — fluffy cloud with blue shadow detail
    ctx.fillStyle = '#C8CCE8';
    ctx.fillRect(19 * T, 0, T, T);
    // Cloud puff highlights
    ctx.fillStyle = '#D8DCF0';
    ctx.fillRect(19 * T + 2, 1, 5, 4);
    ctx.fillRect(19 * T + 8, 3, 6, 4);
    ctx.fillRect(19 * T + 3, 7, 7, 4);
    // Light top highlights
    ctx.fillStyle = '#E8ECFF';
    ctx.fillRect(19 * T + 3, 1, 3, 2);
    ctx.fillRect(19 * T + 9, 3, 4, 2);
    ctx.fillRect(19 * T + 5, 8, 3, 2);
    // Blue shadow lines for depth
    ctx.fillStyle = '#9098C0';
    ctx.fillRect(19 * T + 1, 12, 14, 1);
    ctx.fillRect(19 * T + 0, 14, 5, 1);
    ctx.fillRect(19 * T + 10, 15, 4, 1);
    // Subtle edge outline
    ctx.fillStyle = '#A0A8D0';
    ctx.fillRect(19 * T + 1, 5, 1, 3);
    ctx.fillRect(19 * T + 14, 6, 1, 3);

    // 20 = cloud_pink — more saturated pink cloud
    ctx.fillStyle = '#F0B8D0';
    ctx.fillRect(20 * T, 0, T, T);
    // Pink puff highlights
    ctx.fillStyle = '#F8D0E0';
    ctx.fillRect(20 * T + 3, 1, 5, 4);
    ctx.fillRect(20 * T + 7, 4, 6, 4);
    ctx.fillRect(20 * T + 2, 8, 7, 4);
    // Light spots
    ctx.fillStyle = '#FFE0F0';
    ctx.fillRect(20 * T + 4, 2, 3, 2);
    ctx.fillRect(20 * T + 8, 5, 3, 2);
    ctx.fillRect(20 * T + 4, 9, 3, 2);
    // Darker pink shadows
    ctx.fillStyle = '#C890A8';
    ctx.fillRect(20 * T + 1, 12, 14, 1);
    ctx.fillRect(20 * T + 0, 14, 6, 1);
    ctx.fillRect(20 * T + 9, 15, 5, 1);
    // Edge outline
    ctx.fillStyle = '#D0A0B8';
    ctx.fillRect(20 * T + 1, 5, 1, 3);
    ctx.fillRect(20 * T + 14, 6, 1, 3);

    // 21 = cloud_gold — vivid golden cloud floor
    ctx.fillStyle = '#E8C860';
    ctx.fillRect(21 * T, 0, T, T);
    // Gold puff highlights
    ctx.fillStyle = '#F0D878';
    ctx.fillRect(21 * T + 3, 1, 5, 4);
    ctx.fillRect(21 * T + 8, 3, 5, 5);
    ctx.fillRect(21 * T + 2, 7, 6, 4);
    // Bright gold highlights
    ctx.fillStyle = '#FFE890';
    ctx.fillRect(21 * T + 4, 2, 3, 2);
    ctx.fillRect(21 * T + 9, 4, 3, 2);
    ctx.fillRect(21 * T + 4, 8, 3, 2);
    // White sparkle dots
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(21 * T + 5, 2, 1, 1);
    ctx.fillRect(21 * T + 11, 5, 1, 1);
    ctx.fillRect(21 * T + 3, 9, 1, 1);
    // Amber shadow lines
    ctx.fillStyle = '#B89830';
    ctx.fillRect(21 * T + 1, 12, 14, 1);
    ctx.fillRect(21 * T + 0, 14, 5, 1);
    ctx.fillRect(21 * T + 10, 15, 4, 1);

    // 22 = crystal_floor — sparkling crystal with high contrast
    ctx.fillStyle = '#90A8D8';
    ctx.fillRect(22 * T, 0, T, T);
    // Crystal facets — lighter surfaces
    ctx.fillStyle = '#A8C0E8';
    ctx.fillRect(22 * T + 2, 1, 5, 5);
    ctx.fillRect(22 * T + 9, 4, 4, 6);
    ctx.fillRect(22 * T + 3, 8, 6, 5);
    // Bright crystal highlights
    ctx.fillStyle = '#C8DFFF';
    ctx.fillRect(22 * T + 3, 2, 3, 3);
    ctx.fillRect(22 * T + 10, 5, 2, 3);
    ctx.fillRect(22 * T + 4, 9, 4, 3);
    // Sparkle dots (bright white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(22 * T + 4, 2, 1, 1);
    ctx.fillRect(22 * T + 11, 5, 1, 1);
    ctx.fillRect(22 * T + 6, 10, 1, 1);
    ctx.fillRect(22 * T + 13, 1, 1, 1);
    ctx.fillRect(22 * T + 1, 13, 1, 1);
    // Crystal grid lines (darker blue for structure)
    ctx.fillStyle = '#6878A8';
    ctx.fillRect(22 * T + 7, 0, 1, T);
    ctx.fillRect(22 * T, 7, T, 1);
    // Dark shadow edges
    ctx.fillStyle = '#5868A0';
    ctx.fillRect(22 * T + 0, 15, T, 1);
    ctx.fillRect(22 * T + 15, 0, 1, T);

    // ══════════════════════════════════════════════════════
    //  AUTO-TILE EDGES — extracted from Cute Fantasy auto-tile sets
    //  Layout: 48×96 (3col × 6row), each cell 16×16
    //  Row 0: outerTL, edgeN, outerTR
    //  Row 1: edgeW,   center, edgeE
    //  Row 2: outerBL, edgeS, outerBR
    //  Row 3: innerTL, innerTR, [empty]
    //  Row 4: innerBL, innerBR, [empty]
    //  Row 5: (unused fill variants)
    // ══════════════════════════════════════════════════════

    // Auto-tile extraction positions (same for both water and path)
    const autoPositions = [
      // Edges: N(0), S(1), W(2), E(3)
      { sx: T, sy: 0 },       { sx: T, sy: 2 * T },
      { sx: 0, sy: T },       { sx: 2 * T, sy: T },
      // Outer corners: TL(4), TR(5), BL(6), BR(7)
      { sx: 0, sy: 0 },       { sx: 2 * T, sy: 0 },
      { sx: 0, sy: 2 * T },   { sx: 2 * T, sy: 2 * T },
      // Inner corners: TL(8), TR(9), BL(10), BR(11) — 2×2 block at rows 3-4
      { sx: 0, sy: 3 * T },   { sx: T, sy: 3 * T },
      { sx: 0, sy: 4 * T },   { sx: T, sy: 4 * T },
    ];

    // Tiles 23-34: Water auto-tile edges (from Water_Tile.png)
    for (let i = 0; i < 12; i++) {
      const p = autoPositions[i];
      ctx.drawImage(waterTileImg, p.sx, p.sy, T, T, (23 + i) * T, 0, T, T);
    }

    // Tiles 35-46: Path auto-tile edges (from Path_Tile.png)
    for (let i = 0; i < 12; i++) {
      const p = autoPositions[i];
      ctx.drawImage(pathTileImg, p.sx, p.sy, T, T, (35 + i) * T, 0, T, T);
    }

  } catch (e) {
    console.warn('Asset tiles failed to load, using fallback colors:', e);
    // Fallback: solid color tiles
    const fallbackColors = [
      '#3a7830', '#48903a', '#55a042', '#44953a',
      '#be9e76', '#9b8060', '#917850', '#af9258',
      '#48903a', '#9b9ea8', '#3a7ab0',
      '#F5DEB3', '#C4A97D', '#F0D9A8', '#8B6F47',
      '#3A5A7A', '#4A7A9A', '#3A7A5A', '#7A8A7A',
      '#C8CCE8', '#F0B8D0', '#E8C860', '#90A8D8',
      // Water auto-tiles fallback (12 tiles: edges as mid-blue)
      '#4a8ab0', '#4a8ab0', '#4a8ab0', '#4a8ab0',
      '#5a9ac0', '#5a9ac0', '#5a9ac0', '#5a9ac0',
      '#3a7ab0', '#3a7ab0', '#3a7ab0', '#3a7ab0',
      // Path auto-tiles fallback (12 tiles: edges as mid-brown)
      '#b09070', '#b09070', '#b09070', '#b09070',
      '#c0a080', '#c0a080', '#c0a080', '#c0a080',
      '#be9e76', '#be9e76', '#be9e76', '#be9e76',
    ];
    for (let i = 0; i < TILE_COUNT; i++) {
      ctx.fillStyle = fallbackColors[i];
      ctx.fillRect(i * T, 0, T, T);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Synchronous fallback (generates canvas tiles) — used if async not possible.
 */
export function generateTileset() {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_COUNT * T;
  canvas.height = T;
  const ctx = canvas.getContext('2d');

  // Simple solid colors as placeholder until async version loads
  const colors = [
    '#3a7830', '#48903a', '#55a042', '#44953a',
    '#be9e76', '#9b8060', '#917850', '#af9258',
    '#48903a', '#9b9ea8', '#3a7ab0',
    '#F5DEB3', '#C4A97D', '#F0D9A8', '#8B6F47',
    '#3A5A7A', '#4A7A9A', '#3A7A5A', '#7A8A7A',
    '#C8CCE8', '#F0B8D0', '#E8C860', '#90A8D8',
    // Water auto-tiles
    '#4a8ab0', '#4a8ab0', '#4a8ab0', '#4a8ab0',
    '#5a9ac0', '#5a9ac0', '#5a9ac0', '#5a9ac0',
    '#3a7ab0', '#3a7ab0', '#3a7ab0', '#3a7ab0',
    // Path auto-tiles
    '#b09070', '#b09070', '#b09070', '#b09070',
    '#c0a080', '#c0a080', '#c0a080', '#c0a080',
    '#be9e76', '#be9e76', '#be9e76', '#be9e76',
  ];
  for (let i = 0; i < TILE_COUNT; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i * T, 0, T, T);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const GENERATED_TILE_DEFS = {};
for (let i = 0; i < TILE_COUNT; i++) {
  GENERATED_TILE_DEFS[i] = { x: i, y: 0 };
}
