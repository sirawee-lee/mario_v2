const { ccclass, property } = cc._decorator;

@ccclass
export default class Qblock extends cc.Component {

    @property([cc.Prefab])
    itemPrefabs: cc.Prefab[] = [];
    // 0: Mushroom, 1: Coin

    @property({ type: cc.SpriteFrame })
    usedFrame: cc.SpriteFrame = null;

    @property({ type: cc.AudioClip })
    mushroomSound: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    coinSound: cc.AudioClip = null;

    private hasBeenHit: boolean = false;

    onHit(playerNode: cc.Node) {
        if (this.hasBeenHit) return;
        this.hasBeenHit = true;

        // Visual feedback: bump up then back
        let bump = cc.sequence(
            cc.moveBy(0.08, 0, 10),
            cc.moveBy(0.08, 0, -10)
        );
        this.node.runAction(bump);

        // Change sprite to used block
        if (this.usedFrame) {
            this.getComponent(cc.Sprite).spriteFrame = this.usedFrame;
        }

        // Spawn item
        if (this.itemPrefabs.length > 0) {
            let idx = Math.random() < 0.5 ? 0 : 1;
            let item = cc.instantiate(this.itemPrefabs[idx]);
            this.node.parent.addChild(item);
            item.setPosition(this.node.x, this.node.y + this.node.height);
            if (idx === 0 && this.mushroomSound) {
                cc.audioEngine.playEffect(this.mushroomSound, false);
            } else if (idx === 1 && this.coinSound) {
                cc.audioEngine.playEffect(this.coinSound, false);
            }
        }
    }
}
