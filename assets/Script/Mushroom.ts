const { ccclass } = cc._decorator;

@ccclass
export default class Mushroom extends cc.Component {

    private moveSpeed: number = 60;

    start() {
        // popup ขึ้นมาก่อน
        cc.tween(this.node)
            .by(0.3, { position: cc.v3(0, 24, 0) })
            .start();
    }

    update(dt) {
        this.node.x += this.moveSpeed * dt;
    }

    onBeginContact(contact, self, other) {
        const normal = contact.getWorldManifold().normal;
        if (normal.x !== 0 && (other.tag === 3 || other.node.name === "Ground")) {
            this.moveSpeed *= -1;
        }
        if (other.node.name === "Lower_bound") {
            this.node.destroy();
        }
    }
}
