const { ccclass, property } = cc._decorator;

@ccclass
export default class Qblock extends cc.Component {

    @property(cc.Prefab) mushroomPrefab: cc.Prefab = null;
    @property(cc.SpriteFrame) usedFrame: cc.SpriteFrame = null;
    @property({ type: cc.AudioClip }) mushroomSound: cc.AudioClip = null;

    private used: boolean = false;

    onHit() {
        if (this.used) return;
        this.used = true;

        // bump animation
        cc.tween(this.node)
            .by(0.08, { position: cc.v3(0, 12, 0) })
            .by(0.08, { position: cc.v3(0, -12, 0) })
            .start();

        // เปลี่ยนเป็น used block
        if (this.usedFrame) {
            this.getComponent(cc.Sprite).spriteFrame = this.usedFrame;
        }

        // spawn mushroom
        if (this.mushroomPrefab) {
            let item = cc.instantiate(this.mushroomPrefab);
            this.node.parent.addChild(item);
            item.setPosition(this.node.x, this.node.y + this.node.height);
            if (this.mushroomSound) cc.audioEngine.playEffect(this.mushroomSound, false);
        }
    }
}
