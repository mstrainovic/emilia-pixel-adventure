import * as THREE from 'three';

/**
 * Floating emotion/thought bubbles above NPCs.
 * Shows context-sensitive icons that add personality:
 * - Heart when player is near
 * - Exclamation when quest available
 * - Zzz when idle for a while
 * - Music note randomly
 */

const BUBBLE_EMOJIS = {
  heart: '♥',
  quest: '!',
  zzz: '💤',
  music: '♪',
  happy: '☺',
  sparkle: '✦',
};

// Cache canvas textures per emoji
const _texCache = new Map();

function getEmojiTexture(emoji) {
  if (_texCache.has(emoji)) return _texCache.get(emoji);
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 16, 16);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  _texCache.set(emoji, tex);
  return tex;
}

export class EmotionBubbles {
  constructor(scene) {
    this._scene = scene;
    this._bubbles = []; // active floating bubbles
    this._npcTimers = new Map(); // npcId → { idleTime, lastBubble }
    this._time = 0;
  }

  /**
   * Spawn a bubble above an entity.
   * @param {object} entity — needs x, y properties
   * @param {string} type — key from BUBBLE_EMOJIS
   * @param {number} [duration] — how long it's visible
   */
  spawn(entity, type, duration = 2.0) {
    const emoji = BUBBLE_EMOJIS[type] || type;
    const tex = getEmojiTexture(emoji);
    const geo = new THREE.PlaneGeometry(0.5, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 6;

    mesh.position.set(entity.x, -entity.y + 0.8, 0.9);
    this._scene.add(mesh);

    this._bubbles.push({
      mesh, entity, type,
      age: 0, duration,
      startY: -entity.y + 0.8,
    });
  }

  /**
   * Update NPC emotion logic + animate active bubbles.
   * @param {object[]} npcs — array of NPC entities
   * @param {object} player — player entity
   * @param {object} progression — for quest checking
   */
  updateNPCs(dt, npcs, player, progression) {
    this._time += dt;

    for (const npc of npcs) {
      const id = npc._characterId || npc.id;
      if (!id) continue;

      let timer = this._npcTimers.get(id);
      if (!timer) {
        timer = { idleTime: 0, lastBubble: 0, lastType: null };
        this._npcTimers.set(id, timer);
      }

      timer.idleTime += dt;
      timer.lastBubble += dt;

      // Don't spam bubbles
      if (timer.lastBubble < 8) continue;

      const dx = player.x - npc.x;
      const dy = player.y - npc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Player nearby — heart or quest
      if (dist < 3) {
        // Check if NPC has available quest
        const activeQuest = progression?.getActiveQuest?.();
        if (activeQuest && this._npcHasQuest(id, activeQuest)) {
          this.spawn(npc, 'quest', 2.5);
          timer.lastBubble = 0;
          timer.lastType = 'quest';
        } else if (timer.lastType !== 'heart') {
          this.spawn(npc, 'heart', 2.0);
          timer.lastBubble = 0;
          timer.lastType = 'heart';
        }
      }
      // Idle for a long time — zzz or music
      else if (timer.idleTime > 15) {
        const type = Math.random() < 0.5 ? 'zzz' : 'music';
        this.spawn(npc, type, 2.5);
        timer.lastBubble = 0;
        timer.idleTime = 0;
        timer.lastType = type;
      }
    }
  }

  _npcHasQuest(npcId, activeQuest) {
    // Simple mapping of quest NPCs
    const questNpcs = {
      mama: ['gather_herbs', 'cook_feast'],
      papa: ['bring_wood', 'craft_tools'],
      oma: ['garden_help', 'seed_collector'],
      opa: ['fish_catch'],
      marie: ['deep_explorer', 'collect_shells'],
      liam: ['monster_hunter', 'brave_warrior'],
      baba: ['korallen_heilen'],
      deda: ['dungeon_explorer'],
    };
    const quests = questNpcs[npcId];
    return quests && quests.includes(activeQuest.id);
  }

  update(dt) {
    // Animate active bubbles
    for (let i = this._bubbles.length - 1; i >= 0; i--) {
      const b = this._bubbles[i];
      b.age += dt;

      if (b.age >= b.duration) {
        this._scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
        this._bubbles.splice(i, 1);
        continue;
      }

      const t = b.age / b.duration;

      // Float upward gently
      const floatY = b.startY + b.age * 0.3;
      b.mesh.position.set(b.entity.x + 0.3, floatY, 0.9);

      // Scale: pop in, then shrink at end
      let scale = 1;
      if (t < 0.15) {
        scale = t / 0.15 * 1.2; // grow
      } else if (t < 0.25) {
        scale = 1.2 - (t - 0.15) / 0.1 * 0.2; // settle to 1.0
      } else if (t > 0.8) {
        scale = (1 - t) / 0.2; // shrink at end
      }
      b.mesh.scale.setScalar(Math.max(0, scale));

      // Opacity: fade in and out
      let opacity = 1;
      if (t < 0.1) opacity = t * 10;
      else if (t > 0.75) opacity = (1 - t) / 0.25;
      b.mesh.material.opacity = Math.max(0, opacity);
    }
  }

  dispose() {
    for (const b of this._bubbles) {
      this._scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      b.mesh.material.dispose();
    }
    this._bubbles = [];
    this._npcTimers.clear();
  }
}
