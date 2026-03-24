import * as THREE from 'three';

/**
 * Ambient birds that sit on trees and fly off periodically.
 * Canvas-drawn 8x8 sprite, 4 animation frames (sit, flap1, flap2, glide).
 * AI: sit on tree for 10-20s, fly to another tree, sit again.
 * No interaction with player, purely visual.
 */

const BIRD_COLORS = [
  { body: '#4A3728', wing: '#6B5240', belly: '#8B7355' }, // brown sparrow
  { body: '#2244AA', wing: '#3366CC', belly: '#88AADD' }, // bluebird
  { body: '#CC3333', wing: '#DD5555', belly: '#EE8888' }, // robin
  { body: '#228822', wing: '#33AA33', belly: '#88CC88' }, // finch
];

export class Bird {
  constructor(x, y, scene, colorIndex) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;

    this._state = 'sitting'; // sitting, flying, landing
    this._stateTimer = 10 + Math.random() * 10; // sit for 10-20s
    this._flyTarget = null;
    this._colorDef = BIRD_COLORS[colorIndex % BIRD_COLORS.length];

    this._animFrame = 0;
    this._animTimer = 0;

    this._mesh = null;
    this._texture = null;
    this._scene = scene;

    this._createSprite(scene);
  }

  _createSprite(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 32; // 4 frames x 8px
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    const c = this._colorDef;

    // Frame 0: sitting (compact, wings folded)
    ctx.fillStyle = c.body;
    ctx.fillRect(2, 3, 4, 4); // body
    ctx.fillRect(1, 2, 3, 2); // head
    ctx.fillStyle = c.belly;
    ctx.fillRect(3, 4, 2, 3); // belly
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(0, 3, 1, 1); // beak
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(1, 2, 1, 1); // eye

    // Frame 1: wings up
    ctx.fillStyle = c.body;
    ctx.fillRect(10, 3, 4, 4);
    ctx.fillRect(9, 2, 3, 2);
    ctx.fillStyle = c.wing;
    ctx.fillRect(10, 0, 3, 3); // wing up
    ctx.fillStyle = c.belly;
    ctx.fillRect(11, 4, 2, 3);
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(8, 3, 1, 1);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(9, 2, 1, 1);

    // Frame 2: wings down
    ctx.fillStyle = c.body;
    ctx.fillRect(18, 3, 4, 4);
    ctx.fillRect(17, 2, 3, 2);
    ctx.fillStyle = c.wing;
    ctx.fillRect(18, 5, 3, 3); // wing down
    ctx.fillStyle = c.belly;
    ctx.fillRect(19, 4, 2, 3);
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(16, 3, 1, 1);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(17, 2, 1, 1);

    // Frame 3: glide (wings spread)
    ctx.fillStyle = c.body;
    ctx.fillRect(26, 3, 4, 3);
    ctx.fillRect(25, 2, 3, 2);
    ctx.fillStyle = c.wing;
    ctx.fillRect(24, 3, 8, 2); // spread wings
    ctx.fillStyle = c.belly;
    ctx.fillRect(27, 4, 2, 2);
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(24, 3, 1, 1);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(25, 2, 1, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const clonedTex = texture.clone();
    clonedTex.needsUpdate = true;
    clonedTex.magFilter = THREE.NearestFilter;
    clonedTex.minFilter = THREE.NearestFilter;
    clonedTex.repeat.set(0.25, 1);
    clonedTex.offset.set(0, 0);

    const geo = new THREE.PlaneGeometry(0.5, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      map: clonedTex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });

    this._mesh = new THREE.Mesh(geo, mat);
    this._texture = clonedTex;
    this._baseTexture = texture;

    scene.add(this._mesh);
  }

  update(dt) {
    this._stateTimer -= dt;

    switch (this._state) {
      case 'sitting':
        this._animFrame = 0; // sitting frame
        if (this._stateTimer <= 0) {
          // Pick a random nearby target and fly there
          this._flyTarget = {
            x: this.startX + (Math.random() - 0.5) * 8,
            y: this.startY + (Math.random() - 0.5) * 4,
          };
          this._state = 'flying';
          this._stateTimer = 5; // max flight time
        }
        break;

      case 'flying':
        // Animate wings
        this._animTimer += dt * 1000;
        if (this._animTimer >= 150) {
          this._animTimer = 0;
          this._animFrame = this._animFrame === 1 ? 2 : 1;
        }

        // Move toward target
        if (this._flyTarget) {
          const dx = this._flyTarget.x - this.x;
          const dy = this._flyTarget.y - this.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0.3) {
            this.x += (dx / len) * 3 * dt;
            this.y += (dy / len) * 3 * dt;
          } else {
            this._state = 'sitting';
            this._stateTimer = 10 + Math.random() * 10;
          }
        }

        if (this._stateTimer <= 0) {
          this._state = 'sitting';
          this._stateTimer = 10 + Math.random() * 10;
        }
        break;
    }

    // Update texture frame
    if (this._texture) {
      this._texture.offset.x = this._animFrame * 0.25;
    }

    // Update position
    if (this._mesh) {
      this._mesh.position.set(this.x, -this.y + 0.5, 0.4 + this.y * 0.001);
    }
  }

  dispose() {
    if (this._scene && this._mesh) {
      this._scene.remove(this._mesh);
    }
    if (this._mesh) {
      this._mesh.geometry.dispose();
      this._mesh.material.dispose();
      if (this._texture) this._texture.dispose();
      if (this._baseTexture) this._baseTexture.dispose();
    }
  }
}

/**
 * Create birds for a scene based on tree positions.
 * @param {string} sceneName
 * @param {THREE.Scene} scene
 * @param {Array} props - map props array (to find tree positions)
 * @returns {Bird[]}
 */
export function createBirdsForScene(sceneName, scene, props) {
  // Only outdoor scenes get birds
  const outdoorScenes = ['hub', 'forest', 'lake', 'unicorn_meadow', 'cloud_castle'];
  if (!outdoorScenes.includes(sceneName)) return [];

  // Find tree props
  const trees = props.filter(p => p.type === 'tree' || p.type === 'palm' || p.type === 'oak_tree');
  if (trees.length === 0) return [];

  // Place 1-2 birds per scene on random tree positions
  const birdCount = Math.min(2, trees.length);
  const birds = [];
  const usedIndices = new Set();

  for (let i = 0; i < birdCount; i++) {
    let idx;
    do { idx = Math.floor(Math.random() * trees.length); } while (usedIndices.has(idx) && usedIndices.size < trees.length);
    usedIndices.add(idx);
    const tree = trees[idx];
    birds.push(new Bird(tree.x, tree.y - 1, scene, i)); // perch above tree base
  }

  return birds;
}
