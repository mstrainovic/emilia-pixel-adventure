import * as THREE from 'three';
import { TILE_SIZE } from '../utils/Constants.js';

/**
 * Renders a tile map using individual planes (simple approach for M1).
 * Each tile is a 1x1 unit plane textured from the tileset.
 */
export class TileMapRenderer {
  constructor(scene) {
    this.scene = scene;
    this.groundGroup = new THREE.Group();
    this.propGroup = new THREE.Group();
    scene.add(this.groundGroup);
    scene.add(this.propGroup);
  }

  /**
   * Build ground layer from tile map data
   * @param {object} mapData - { width, height, ground[][], tilesetTexture, tileDefinitions }
   */
  buildGround(mapData) {
    this.clearGround();

    const { width, height, ground, tilesetTexture, tileDefs } = mapData;
    const texW = tilesetTexture.image.width;
    const texH = tilesetTexture.image.height;

    // Create a single geometry for all ground tiles (instanced)
    const geometry = new THREE.PlaneGeometry(1, 1);

    // Group tiles by type for batching
    const tilesByType = {};

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const tileId = ground[row][col];
        if (tileId === -1) continue;

        if (!tilesByType[tileId]) tilesByType[tileId] = [];
        tilesByType[tileId].push({ col, row });
      }
    }

    // Create instanced mesh per tile type
    for (const [tileId, positions] of Object.entries(tilesByType)) {
      const def = tileDefs[tileId];
      if (!def) continue;

      const mat = new THREE.MeshStandardMaterial({
        map: tilesetTexture.clone(),
        transparent: true,
        alphaTest: 0.01,
        roughness: 0.95,
        metalness: 0.0,
      });

      // Set UV to show just this tile from the tileset
      mat.map.magFilter = THREE.NearestFilter;
      mat.map.minFilter = THREE.NearestFilter;
      mat.map.generateMipmaps = false;
      mat.map.colorSpace = THREE.SRGBColorSpace;
      mat.map.repeat.set(TILE_SIZE / texW, TILE_SIZE / texH);
      mat.map.offset.set(
        (def.x * TILE_SIZE) / texW,
        1 - ((def.y + 1) * TILE_SIZE) / texH
      );

      const instanced = new THREE.InstancedMesh(geometry, mat, positions.length);
      const dummy = new THREE.Object3D();

      positions.forEach((pos, i) => {
        dummy.position.set(pos.col + 0.5, -(pos.row + 0.5), 0);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      });

      instanced.instanceMatrix.needsUpdate = true;
      this.groundGroup.add(instanced);
    }
  }

  /**
   * Add a prop (static sprite) at a world position
   */
  addProp(texture, x, y, widthTiles, heightTiles, zOffset = 0.1) {
    const geo = new THREE.PlaneGeometry(widthTiles, heightTiles);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false
    });
    mat.map.magFilter = THREE.NearestFilter;
    mat.map.minFilter = THREE.NearestFilter;
    mat.map.generateMipmaps = false;
    mat.map.colorSpace = THREE.SRGBColorSpace;

    const mesh = new THREE.Mesh(geo, mat);
    // Position: center of prop, Y flipped, z for depth sorting
    mesh.position.set(
      x + widthTiles / 2,
      -(y + heightTiles / 2),
      zOffset + y * 0.001
    );
    this.propGroup.add(mesh);
    return mesh;
  }

  /**
   * Add a prop from a region of a larger sprite sheet
   */
  addPropFromSheet(texture, srcX, srcY, srcW, srcH, worldX, worldY, widthTiles, heightTiles) {
    const texW = texture.image.width;
    const texH = texture.image.height;

    const clonedTex = texture.clone();
    clonedTex.magFilter = THREE.NearestFilter;
    clonedTex.minFilter = THREE.NearestFilter;
    clonedTex.generateMipmaps = false;
    clonedTex.colorSpace = THREE.SRGBColorSpace;
    clonedTex.repeat.set(srcW / texW, srcH / texH);
    clonedTex.offset.set(srcX / texW, 1 - (srcY + srcH) / texH);

    const geo = new THREE.PlaneGeometry(widthTiles, heightTiles);
    const mat = new THREE.MeshBasicMaterial({
      map: clonedTex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      worldX + widthTiles / 2,
      -(worldY + heightTiles / 2),
      0.1 + worldY * 0.001
    );
    this.propGroup.add(mesh);
    return mesh;
  }

  clearGround() {
    while (this.groundGroup.children.length > 0) {
      const child = this.groundGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
      this.groundGroup.remove(child);
    }
  }

  clearProps() {
    while (this.propGroup.children.length > 0) {
      const child = this.propGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
      this.propGroup.remove(child);
    }
  }

  dispose() {
    this.clearGround();
    this.clearProps();
    this.scene.remove(this.groundGroup);
    this.scene.remove(this.propGroup);
  }
}
