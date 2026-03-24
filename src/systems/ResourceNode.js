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
      shell:    { hitsNeeded: 1, loot: 'shell_common', lootMin: 1, lootMax: 1, respawn: 480, color: 0xe8d5a3 },
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

    // Visual indicator
    const size = this.type === 'mushroom' || this.type === 'earth' ? 0.6 : 1.0;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      color: def.color,
      transparent: true,
      opacity: 0.8,
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
          this.mesh.material.opacity = 0.8;
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

    // Shake animation
    this.mesh.material.opacity = 0.5 + 0.3 * Math.sin(this.currentHits * 3);

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
    this.mesh.material.dispose();
    this.promptMesh.geometry.dispose();
    this.promptMesh.material.map.dispose();
    this.promptMesh.material.dispose();
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
