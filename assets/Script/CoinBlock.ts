const { ccclass, property } = cc._decorator;

@ccclass
export default class CoinBlock extends cc.Component {

    @property(cc.SpriteFrame) usedFrame: cc.SpriteFrame = null;
    @property({ type: cc.AudioClip }) coinSound: cc.AudioClip = null;
    @property coinCount: number = 10;

    private remaining: number = 0;

    onLoad() {
        this.remaining = this.coinCount;
    }

    onHit() {
        if (this.remaining <= 0) return;

        // bump animation
        cc.tween(this.node)
            .by(0.08, { position: cc.v3(0, 12, 0) })
            .by(0.08, { position: cc.v3(0, -12, 0) })
            .start();

        if (this.coinSound) cc.audioEngine.playEffect(this.coinSound, false);

        // spawn coin popup ลอยขึ้น
        this.spawnCoinPopup();

        // บวกเหรียญให้ Mario
        const marioNode = cc.find("Canvas/Mario");
        if (marioNode) {
            const pc = marioNode.getComponent("PlayerController") as any;
            if (pc) pc.addCoin();
        }

        this.remaining--;

        if (this.remaining <= 0) {
            // เปลี่ยนเป็นกล่องตัน
            if (this.usedFrame) {
                this.getComponent(cc.Sprite).spriteFrame = this.usedFrame;
            }
            // เปลี่ยน tag collider เป็นกล่องธรรมดา (ไม่มี onHit อีก)
        }
    }

    private spawnCoinPopup() {
        const popup = new cc.Node();
        const label = popup.addComponent(cc.Label);
        label.string = "+1";
        label.fontSize = 22;
        label.lineHeight = 26;
        popup.color = new cc.Color(255, 215, 0);
        popup.setPosition(this.node.x, this.node.y + this.node.height + 8);
        this.node.parent.addChild(popup);

        cc.tween(popup)
            .to(0.7, { position: cc.v3(this.node.x, this.node.y + this.node.height + 50, 0), opacity: 0 })
            .call(() => { popup.destroy(); })
            .start();
    }
}
