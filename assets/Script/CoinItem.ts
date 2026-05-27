const { ccclass, property } = cc._decorator;

@ccclass
export default class CoinItem extends cc.Component {

    onLoad() {
        // Float up then destroy
        let up = cc.moveBy(0.5, 0, 50);
        let fade = cc.fadeOut(0.3);
        let seq = cc.sequence(up, fade, cc.callFunc(() => {
            this.node.destroy();
        }));
        this.node.runAction(seq);
    }
}
