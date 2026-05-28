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
        // ชนท่อหรือกำแพงข้างๆ → กลับทิศ
        const normal = contact.getWorldManifold().normal;
        if (Math.abs(normal.x) > 0.5 && other.tag !== 2) {
            this.moveSpeed *= -1;
        }
        // ตกหลุม → destroy
        if (other.node.name === "Lower_bound") {
            this.node.destroy();
        }
    }
}
