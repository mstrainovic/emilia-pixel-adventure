/** Die Teile des Tiled-JSON-Formats, die das Spiel liest. */

export interface TiledProperty {
  name: string;
  type: 'string' | 'int' | 'float' | 'bool';
  value: string | number | boolean;
}

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  point?: boolean;
  properties?: TiledProperty[];
}

export interface TiledTileLayer {
  id: number;
  name: string;
  type: 'tilelayer';
  width: number;
  height: number;
  x: number;
  y: number;
  opacity: number;
  visible: boolean;
  /** Zeilenweise; 0 = leer, sonst Kachelkennung + 1. */
  data: number[];
}

export interface TiledObjectLayer {
  id: number;
  name: string;
  type: 'objectgroup';
  draworder: 'topdown';
  x: number;
  y: number;
  opacity: number;
  visible: boolean;
  objects: TiledObject[];
}

export type TiledLayer = TiledTileLayer | TiledObjectLayer;

export interface TiledTileset {
  firstgid: number;
  name: string;
  tilewidth: number;
  tileheight: number;
  tilecount: number;
  columns: number;
  image: string;
  imagewidth: number;
  imageheight: number;
  margin: number;
  spacing: number;
}

export interface TiledMap {
  type: 'map';
  version: string;
  tiledversion: string;
  orientation: 'orthogonal';
  renderorder: 'right-down';
  infinite: boolean;
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  nextlayerid: number;
  nextobjectid: number;
  tilesets: TiledTileset[];
  layers: TiledLayer[];
}
