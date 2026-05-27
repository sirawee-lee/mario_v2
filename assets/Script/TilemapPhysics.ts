const { ccclass, property } = cc._decorator;

@ccclass
export default class TilemapPhysics extends cc.Component {

  @property(cc.TiledMap)
  tiledMap: cc.TiledMap = null;

  onLoad() {
    cc.director.getPhysicsManager().enabled = true;
    this.buildColliders();
  }

  private buildColliders() {
    if (!this.tiledMap) {
      cc.warn("TilemapPhysics: no tiledMap assigned");
      return;
    }

    const mapSize = this.tiledMap.getMapSize();       // tiles
    const tileSize = this.tiledMap.getTileSize();     // pixels per tile
    const mapH = mapSize.height * tileSize.height;   // total map height in px

    // TileMap node position in canvas (anchor 0,0 → bottom-left corner)
    const mapX = this.tiledMap.node.x;  // -480
    const mapY = this.tiledMap.node.y;  // -320

    const group = this.tiledMap.getObjectGroup("physics");
    if (!group) {
      cc.warn("TilemapPhysics: no 'physics' object group found in TMX");
      return;
    }

    const objects = group.getObjects();
    for (const obj of objects) {
      const name: string = obj["name"] || "collider";
      const tx: number = obj["x"] || 0;
      const ty: number = obj["y"] || 0;  // Tiled Y is from top
      const w: number  = obj["width"] || 0;
      const h: number  = obj["height"] || 0;

      if (w === 0 || h === 0) continue;

      // Convert Tiled coords → Cocos canvas coords (center of box)
      // Tiled: origin top-left, Y down
      // Cocos: TileMap anchor(0,0) at (mapX, mapY), Y up
      const cx = mapX + tx + w / 2;
      const cy = mapY + (mapH - ty) - h / 2;

      const node = new cc.Node(name);
      node.setParent(this.node.parent);
      node.setPosition(cx, cy);
      node.width = w;
      node.height = h;

      const rb = node.addComponent(cc.RigidBody);
      rb.type = cc.RigidBodyType.Static;

      const col = node.addComponent(cc.PhysicsBoxCollider);
      col.offset = cc.v2(0, 0);
      col.size = cc.size(w, h);

      // tag: Lower_bound = 9, everything else = 3
      col.tag = (name === "Lower_bound") ? 9 : 3;
    }

    cc.log(`TilemapPhysics: created colliders from ${objects.length} physics objects`);
  }
}
