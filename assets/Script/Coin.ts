const { ccclass } = cc._decorator;

@ccclass
export default class Coin extends cc.Component {

    onLoad() {
        const rb = this.getComponent(cc.RigidBody);
        if (rb) rb.enabledContactListener = true;
    }

    onBeginContact(_contact: any, _self: any, other: any) {
        const pc = other.node.getComponent("PlayerController");
        if (pc) {
            (pc as any).addCoin();
            this.showPopup();
            this.node.destroy();
        }
    }

    private showPopup() {
        const popup = new cc.Node();
        const label = popup.addComponent(cc.Label);
        label.string = "+50";
        label.fontSize = 24;
        label.lineHeight = 28;
        popup.color = new cc.Color(255, 255, 255);
        popup.setPosition(this.node.x, this.node.y + 20);
        this.node.parent.addChild(popup);

        cc.tween(popup)
            .to(0.6, { position: cc.v3(this.node.x, this.node.y + 60, 0), opacity: 0 })
            .call(() => { popup.destroy(); })
            .start();
    }
}
