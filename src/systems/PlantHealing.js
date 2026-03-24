import * as THREE from 'three';

/**
 * A wilted plant that Emilia can heal with her water magic (F key).
 * Healing 10 plants unlocks the unicorn meadow.
 */
class WiltedPlant {
  constructor(x, y, scene) {
    this.x = x;
    this.y = y;
    this.healed = false;
    this.healRange = 2.0;
    this.scene = scene;

    // Canvas-drawn wilted plant (much more visible than a brown square)
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Dirt mound
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(8, 24, 16, 6);
    ctx.fillRect(10, 22, 12, 4);
    // Wilted stem
    ctx.fillStyle = '#886644';
    ctx.fillRect(15, 8, 2, 16);
    // Drooping leaves (brown/yellow — clearly wilted)
    ctx.fillStyle = '#99774a';
    ctx.fillRect(10, 8, 5, 3);
    ctx.fillRect(9, 10, 4, 3);
    ctx.fillRect(17, 10, 5, 3);
    ctx.fillRect(18, 12, 4, 3);
    // Small wilted flower top
    ctx.fillStyle = '#aa8855';
    ctx.fillRect(13, 5, 6, 4);
    ctx.fillRect(14, 4, 4, 2);
    // Water droplet hint (blue — shows it needs water)
    ctx.fillStyle = '#55aaee';
    ctx.fillRect(23, 3, 4, 5);
    ctx.fillRect(24, 1, 2, 3);
    ctx.fillRect(23, 7, 4, 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    const geo = new THREE.PlaneGeometry(1.2, 1.2);
    this.mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.position.set(x + 0.5, -(y + 0.5), 0.11 + y * 0.001);
    scene.add(this.mesh);

    // "F" hint label — hidden by default, shown when player is near
    this.hintMesh = this._createHint();

    // Heal effect particles (hidden initially)
    this.healEffect = null;
  }

  _createHint() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    // Background pill
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(4, 2, 56, 28, 8);
    ctx.fill();
    // Text
    ctx.fillStyle = '#55CCFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', 32, 16);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    const geo = new THREE.PlaneGeometry(1.0, 0.5);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(this.x + 0.5, -(this.y - 0.3), 0.5);
    this.scene.add(mesh);
    return mesh;
  }

  update(dt, player, inputManager) {
    if (this.healed) return false;

    const dx = player.x - (this.x + 0.5);
    const dy = player.y - (this.y + 0.5);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Show/hide hint based on proximity
    if (this.hintMesh) {
      const showHint = dist < this.healRange * 1.5;
      const target = showHint ? 0.9 : 0;
      this.hintMesh.material.opacity += (target - this.hintMesh.material.opacity) * 0.1;
      this.hintMesh.position.y = -(this.y - 0.3) + Math.sin(Date.now() * 0.003) * 0.1;
    }

    if (dist < this.healRange && inputManager.justPressed('KeyF')) {
      this.heal();
      return true;
    }

    // Wilted animation — gentle sway + pulse
    const t = Date.now() * 0.002;
    this.mesh.rotation.z = Math.sin(t) * 0.15;
    this.mesh.scale.setScalar(0.95 + Math.sin(t * 1.5) * 0.05);

    return false;
  }

  heal() {
    this.healed = true;

    // Remove hint
    if (this.hintMesh) {
      this.scene.remove(this.hintMesh);
      this.hintMesh.geometry.dispose();
      this.hintMesh.material.map.dispose();
      this.hintMesh.material.dispose();
      this.hintMesh = null;
    }

    // Replace texture with a healthy green plant
    this._replaceWithHealthyPlant();

    // Bloom/sparkle effect
    this._showHealEffect();

    // Growth animation — scale up from small
    this.mesh.scale.set(0.3, 0.3, 1);
    let growT = 0;
    const growAnim = () => {
      growT += 0.02;
      if (growT > 1) {
        this.mesh.scale.set(1.1, 1.1, 1);
        return;
      }
      // Elastic ease-out
      const t = 1 - Math.pow(1 - growT, 3);
      const s = 0.3 + t * 0.8 + Math.sin(growT * 6) * 0.05 * (1 - growT);
      this.mesh.scale.set(s, s, 1);
      requestAnimationFrame(growAnim);
    };
    growAnim();

    setTimeout(() => {
      if (this.healEffect) {
        this.scene.remove(this.healEffect);
        this.healEffect = null;
      }
    }, 2500);
  }

  _replaceWithHealthyPlant() {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Dirt mound
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(8, 24, 16, 6);
    ctx.fillRect(10, 22, 12, 4);
    // Healthy stem
    ctx.fillStyle = '#2d8a2d';
    ctx.fillRect(15, 6, 2, 18);
    // Lush green leaves
    ctx.fillStyle = '#3daa3d';
    ctx.fillRect(10, 8, 5, 4);
    ctx.fillRect(9, 10, 4, 4);
    ctx.fillRect(17, 8, 5, 4);
    ctx.fillRect(18, 10, 4, 4);
    ctx.fillRect(11, 14, 4, 3);
    ctx.fillRect(17, 14, 4, 3);
    // Bright flower on top
    ctx.fillStyle = '#ff66aa';
    ctx.fillRect(13, 2, 6, 5);
    ctx.fillRect(14, 1, 4, 2);
    // Flower center
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(15, 3, 2, 2);
    // Sparkle
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(22, 2, 2, 2);
    ctx.fillRect(7, 5, 2, 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    if (this.mat.map) this.mat.map.dispose();
    this.mat.map = tex;
    this.mat.color.set(0xffffff); // reset tint
    this.mat.needsUpdate = true;
  }

  _showHealEffect() {
    // Multiple sparkle rings
    const createRing = (delay, color, size) => {
      setTimeout(() => {
        if (!this.scene) return;
        const geo = new THREE.RingGeometry(0.1, size, 16);
        const mat = new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.9,
          side: THREE.DoubleSide, depthWrite: false,
        });
        const ring = new THREE.Mesh(geo, mat);
        ring.position.set(this.x + 0.5, -(this.y + 0.5), 0.3);
        this.scene.add(ring);

        let t = 0;
        const animate = () => {
          t += 0.025;
          if (t > 1) {
            this.scene.remove(ring);
            ring.geometry.dispose();
            mat.dispose();
            return;
          }
          ring.scale.set(1 + t * 4, 1 + t * 4, 1);
          mat.opacity = 0.9 * (1 - t);
          requestAnimationFrame(animate);
        };
        animate();
      }, delay);
    };

    createRing(0, 0x44ddff, 0.4);
    createRing(150, 0x44ff88, 0.5);
    createRing(300, 0xffdd44, 0.3);

    this.healEffect = { dispose: () => {} }; // dummy for cleanup
  }

  dispose() {
    if (this.mesh.parent) this.scene.remove(this.mesh);
    if (this.healEffect && this.healEffect.parent) this.scene.remove(this.healEffect);
    if (this.hintMesh && this.hintMesh.parent) this.scene.remove(this.hintMesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    if (this.hintMesh) { this.hintMesh.geometry.dispose(); this.hintMesh.material.dispose(); }
  }
}

/**
 * Manages all wilted plants and tracks total healed count.
 */
export class PlantHealingSystem {
  constructor(scene) {
    this.scene = scene;
    this.plants = [];
    this.totalHealed = 0; // persists across scenes
    this.unicornUnlocked = false;
    this.onUnlock = null; // callback when 10 plants healed
  }

  createFromProps(props) {
    const wiltedProps = props.filter(p => p.type === 'wilted_plant');
    for (const prop of wiltedProps) {
      this.plants.push(new WiltedPlant(prop.x, prop.y, this.scene));
    }
  }

  update(dt, player, inputManager, hud) {
    for (const plant of this.plants) {
      const wasHealed = plant.update(dt, player, inputManager);
      if (wasHealed) {
        this.totalHealed++;
        if (window.__game?.audio) window.__game.audio.playPlantHeal();
        if (window.__game?.progression) {
          window.__game.progression.addXp(10);
          window.__game.progression.reportHeal();
        }
        if (hud) hud.showInfo(`Pflanze geheilt! +10 XP (${this.totalHealed}/10)`);

        if (this.totalHealed >= 10 && !this.unicornUnlocked) {
          this.unicornUnlocked = true;
          if (hud) hud.showInfo('Die Magische Wiese ist freigeschaltet!');
          if (this.onUnlock) this.onUnlock();
        }
      }
    }
  }

  clearPlants() {
    for (const plant of this.plants) plant.dispose();
    this.plants = [];
  }

  dispose() {
    this.clearPlants();
  }
}
