const { ccclass, property } = cc._decorator;

@ccclass
export default class Mushroom extends cc.Component {

    private moveSpeed: number = 60;

    onLoad() {
        // Pop up animation
        let appear = cc.moveBy(0.4, 0, 30);
        this.node.runAction(appear);
    }

    update(dt) {
        this.node.x += this.moveSpeed * dt;
    }

    onBeginContact(contact, self, other) {
        if (other.node.name === "ground" || other.tag === 3) {
            if (contact.getWorldManifold().normal.x !== 0) {
                this.moveSpeed *= -1;
            }
        }
    }
}
