import * as THREE from 'three';

/**
 * An interactive resource in the world (tree, rock, ore, mushroom, earth spot).
 * Player walks up and presses E to gather.
 */
export class ResourceNode {
  constructor(config, scene) {
    this.type = config.resourceType; // 'tree', 'rock', 'ore', 'mushroom', 'earth'
    this.x = config.x;
    this.y = config.y;
    this.scene = scene;

    // Gathering config
    const defs = {
      tree:     { hitsNeeded: 1, loot: 'wood',     lootMin: 2, lootMax: 4, respawn: 15, color: 0x5a3a1a },
      rock:     { hitsNeeded: 1, loot: 'stone',    lootMin: 1, lootMax: 3, respawn: 20, color: 0x777777 },
      ore:      { hitsNeeded: 2, loot: 'iron_ore', lootMin: 1, lootMax: 2, respawn: 30, color: 0x8a5533 },
      mushroom: { hitsNeeded: 1, loot: 'mushroom',  lootMin: 1, lootMax: 3, respawn: 15, color: 0xaa7744 },
      earth:    { hitsNeeded: 1, loot: 'earth',     lootMin: 1, lootMax: 2, respawn: 15, color: 0x5a3a1a },
      herb:           { hitsNeeded: 1, loot: 'vegetable',       lootMin: 1, lootMax: 2, respawn: 45,  color: 0x33aa44 },
      shell:          { hitsNeeded: 1, loot: 'shell_common',   lootMin: 1, lootMax: 1, respawn: 480, color: 0xe8d5a3 },
      cloud_crystal:  { hitsNeeded: 2, loot: 'cloud_crystal',  lootMin: 1, lootMax: 2, respawn: 45,  color: 0xaaddff },
      rainbow_shard:  { hitsNeeded: 2, loot: 'rainbow_shard',  lootMin: 1, lootMax: 1, respawn: 60,  color: 0xff99cc },
      star_fragment:  { hitsNeeded: 1, loot: 'star_fragment',  lootMin: 1, lootMax: 2, respawn: 30,  color: 0xffffaa },
    };

    const def = defs[this.type] || defs.rock;
    this.hitsNeeded = config.hitsNeeded ?? def.hitsNeeded;
    this.lootId = def.loot;
    this.itemId = config.itemId || null;
    this.lootMin = def.lootMin;
    this.lootMax = def.lootMax;
    this.respawnTime = config.respawnTime ?? def.respawn;

    this.currentHits = 0;
    this.depleted = false;
    this.respawnTimer = 0;
    this.interactRange = 2.0;

    // Visual indicator — canvas-drawn pixel art
    const size = this.type === 'mushroom' || this.type === 'earth' || this.type === 'herb' ? 0.8 : this.type === 'tree' ? 1.3 : 1.0;
    const tex = ResourceNode._drawSprite(this.type, def.color);
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(this.x + 0.5, -(this.y + 0.5), 0.11 + this.y * 0.001);
    scene.add(this.mesh);

    // Interaction prompt (E)
    this.promptMesh = this._createPrompt();
    this.promptMesh.visible = false;
    scene.add(this.promptMesh);
  }

  _createPrompt() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, 64, 32);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('[E]', 32, 16);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    const geo = new THREE.PlaneGeometry(1, 0.5);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(this.x + 0.5, -(this.y - 0.5), 0.5);
    return mesh;
  }

  update(dt, player, inputManager) {
    if (this.depleted) {
      // respawnTime < 0 means never respawn (one-time pickup)
      if (this.respawnTime >= 0) {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.depleted = false;
          this.currentHits = 0;
          this.mesh.scale.set(1, 1, 1);
          this.mesh.visible = true;
        }
      }
      this.promptMesh.visible = false;
      return null;
    }

    const dx = player.x - (this.x + 0.5);
    const dy = player.y - (this.y + 0.5);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const inRange = dist < this.interactRange;

    this.promptMesh.visible = inRange;

    if (inRange && inputManager.justPressed('KeyE')) {
      return this.gather();
    }

    return null;
  }

  gather() {
    this.currentHits++;

    // Sound effect
    const audio = window.__game?.audio;
    if (audio) {
      if (this.type === 'tree') audio.playChop();
      else if (this.type === 'ore' || this.type === 'rock') audio.playMine();
      else audio.playChop();
    }

    // Shake animation — pulse scale for feedback
    const pulse = 0.8 + 0.2 * Math.sin(this.currentHits * 3);
    this.mesh.scale.set(pulse, pulse, 1);

    if (this.currentHits >= this.hitsNeeded) {
      this.depleted = true;
      this.respawnTimer = this.respawnTime;
      this.mesh.visible = false;
      this.promptMesh.visible = false;

      const count = this.lootMin + Math.floor(Math.random() * (this.lootMax - this.lootMin + 1));

      // itemId override (e.g. shell variants) takes precedence over defs loot table
      const droppedItemId = this.itemId || this.lootId;

      // Grant XP for gathering + quest progress with actual loot count
      const prog = window.__game?.progression;
      if (prog) {
        prog.addXp(5);
        prog.reportCollect(droppedItemId, count);
        if (this.type === 'shell') {
          prog.reportCollectUnique('shell', this.itemId);
        }
      }

      return { itemId: droppedItemId, count, x: this.x + 0.5, y: this.y + 0.5, resourceType: this.type };
    }

    return null; // not yet depleted, but hit registered
  }

  dispose() {
    if (this.mesh.parent) this.scene.remove(this.mesh);
    if (this.promptMesh.parent) this.scene.remove(this.promptMesh);
    this.mesh.geometry.dispose();
    if (this.mesh.material.map) this.mesh.material.map.dispose();
    this.mesh.material.dispose();
    this.promptMesh.geometry.dispose();
    this.promptMesh.material.map.dispose();
    this.promptMesh.material.dispose();
  }

  /** Draw a small pixel-art sprite on canvas for each resource type. */
  static _drawSprite(type, fallbackColor) {
    const s = 16; // pixel size
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d');

    // Helper: draw pixel
    const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    // Helper: fill area
    const fill = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    switch (type) {
      case 'tree':
        // Chopping stump with wood logs
        // Stump base
        fill(5, 9, 6, 5, '#6a4a2a'); // main stump
        fill(4, 10, 8, 4, '#5a3a1a'); // wider base
        fill(6, 8, 4, 2, '#7a5a3a'); // top ring
        // Tree rings on top
        px(7, 8, '#8a6a4a'); px(8, 9, '#8a6a4a');
        // Stacked logs beside stump
        fill(1, 11, 4, 2, '#7a5530'); // log 1
        fill(1, 12, 4, 2, '#6a4520'); // log 2
        fill(2, 10, 3, 1, '#8a6540'); // log 1 top
        // Bark texture
        px(2, 11, '#5a3510'); px(3, 12, '#5a3510');
        // Small green sprout on stump
        fill(7, 6, 2, 2, '#3aaa4e');
        px(7, 5, '#44cc55'); px(8, 5, '#44cc55');
        break;
      case 'rock':
        // Grey boulder
        fill(4, 6, 8, 6, '#888888');
        fill(5, 5, 6, 2, '#999999');
        fill(6, 4, 4, 2, '#aaaaaa');
        px(5, 7, '#777777'); px(9, 8, '#777777'); // shading
        break;
      case 'ore':
        // Brown rock with orange/gold flecks
        fill(4, 6, 8, 7, '#6a4a2a');
        fill(5, 5, 6, 2, '#7a5a3a');
        fill(6, 4, 4, 2, '#8a6a4a');
        px(5, 8, '#ffaa33'); px(8, 7, '#ffaa33'); px(6, 10, '#ffcc44'); // ore flecks
        px(10, 9, '#ffaa33'); px(7, 6, '#ffcc44');
        break;
      case 'mushroom':
        // Red mushroom with white dots
        fill(7, 8, 2, 5, '#c8a070'); // stem
        fill(4, 4, 8, 5, '#cc3333'); // cap
        fill(5, 3, 6, 2, '#dd4444'); // top
        px(5, 5, '#ffffff'); px(8, 4, '#ffffff'); px(10, 6, '#ffffff'); // dots
        break;
      case 'earth':
        // Dirt mound
        fill(4, 8, 8, 5, '#5a3a1a');
        fill(5, 7, 6, 2, '#6a4a2a');
        fill(6, 6, 4, 2, '#7a5a3a');
        px(5, 9, '#4a2a0a'); px(9, 10, '#4a2a0a'); // dark spots
        break;
      case 'herb':
        // Green herb / vegetable plant
        fill(6, 8, 4, 4, '#5a3a1a'); // dirt base
        fill(5, 5, 2, 4, '#22aa33'); // left leaves
        fill(9, 5, 2, 4, '#22aa33'); // right leaves
        fill(7, 3, 2, 5, '#33bb44'); // center stalk
        fill(6, 2, 4, 2, '#44cc55'); // top leaves
        px(7, 2, '#55dd66'); px(8, 3, '#55dd66'); // highlights
        break;
      case 'shell':
        // Spiral shell shape
        fill(5, 6, 6, 5, '#e8d5a3');
        fill(6, 5, 4, 2, '#f0e0b0');
        fill(7, 4, 2, 2, '#f5ecc5');
        px(7, 7, '#d0c090'); px(8, 8, '#c8b880'); // spiral detail
        px(6, 9, '#d0c090');
        break;
      case 'crystal':
        // Blue crystal shard
        fill(7, 3, 2, 10, '#6688cc');
        fill(6, 5, 4, 6, '#7799dd');
        fill(5, 7, 2, 3, '#5577bb');
        px(7, 4, '#99bbee'); px(8, 6, '#aaccff'); // highlights
        break;
      case 'gem':
        // Glowing gem
        fill(6, 5, 4, 6, '#44aacc');
        fill(5, 6, 6, 4, '#55bbdd');
        fill(7, 4, 2, 2, '#66ccee');
        px(6, 6, '#88eeff'); px(8, 7, '#88eeff'); // sparkle
        break;
      case 'cloud_crystal':
        // Pale blue cloud crystal
        fill(6, 3, 4, 10, '#aaddff');
        fill(5, 5, 6, 6, '#bbddff');
        fill(7, 2, 2, 3, '#cceeFF');
        px(6, 4, '#ddeeff'); px(9, 6, '#ffffff'); // shimmer
        px(5, 8, '#88bbdd');
        break;
      case 'rainbow_shard':
        // Multi-colored crystal shard
        fill(7, 3, 2, 10, '#ff6688');
        fill(6, 5, 1, 6, '#ffaa44');
        fill(9, 5, 1, 6, '#44aaff');
        fill(5, 7, 1, 3, '#ffee44');
        fill(10, 7, 1, 3, '#aa66ff');
        px(7, 3, '#ffffff'); px(8, 4, '#ffccdd'); // sparkle
        break;
      case 'star_fragment':
        // Glowing yellow star fragment
        fill(7, 4, 2, 8, '#ffee66');
        fill(5, 6, 6, 4, '#ffdd44');
        px(8, 4, '#ffffaa'); px(6, 5, '#ffffbb'); // glow points
        px(5, 7, '#ffcc33'); px(10, 7, '#ffcc33'); // star tips
        px(7, 3, '#ffffff'); px(8, 11, '#ffffff');
        break;
      default:
        // Generic colored square with border
        fill(3, 3, 10, 10, '#' + (fallbackColor & 0xffffff).toString(16).padStart(6, '0'));
        fill(4, 4, 8, 8, '#' + ((fallbackColor + 0x222222) & 0xffffff).toString(16).padStart(6, '0'));
        break;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
  }
}

/**
 * Manages all resource nodes in the current scene.
 */
export class ResourceManager {
  constructor(scene) {
    this.scene = scene;
    this.nodes = [];
    this.onGather = null; // optional callback(loot) for special gather handling
  }

  createFromProps(props) {
    const resourceProps = props.filter(p => p.type === 'resource');
    for (const prop of resourceProps) {
      this.nodes.push(new ResourceNode(prop, this.scene));
    }
  }

  update(dt, player, inputManager, itemDrops) {
    for (const node of this.nodes) {
      const loot = node.update(dt, player, inputManager);
      if (loot) {
        if (itemDrops) {
          itemDrops.spawnDrop(loot.itemId, loot.count, loot.x, loot.y);
        }
        if (this.onGather) {
          this.onGather(loot);
        }
      }
    }
  }

  dispose() {
    for (const node of this.nodes) node.dispose();
    this.nodes = [];
  }
}
