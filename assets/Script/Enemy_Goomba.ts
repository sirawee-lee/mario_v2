const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy_Goomba extends cc.Component {

    @property({ type: cc.AudioClip })
    stompSound: cc.AudioClip = null;

    private moveSpeed: number = 80;
    private isDead: boolean = false;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    start() {
    }

    update(dt) {
        if (this.isDead) return;
        this.node.x -= this.moveSpeed * dt;
    }

    onBeginContact(contact, self, other) {
        if (this.isDead) return;

        // Stomp: player lands on goomba head
        if (other.tag === 1 && contact.getWorldManifold().normal.y === 1) {
            this.onStomp();
        }

        // Goomba hits a wall → reverse direction
        if (other.node.name === "ground" && contact.getWorldManifold().normal.x !== 0) {
            this.moveSpeed *= -1;
        }
        if (other.tag === 3 && contact.getWorldManifold().normal.x !== 0) {
            this.moveSpeed *= -1;
        }
        if (other.node.name === "left_bound" || other.node.name === "right_bound") {
            this.moveSpeed *= -1;
        }
    }

    private onStomp() {
        this.isDead = true;
        if (this.stompSound) cc.audioEngine.playEffect(this.stompSound, false);
        let rb = this.getComponent(cc.RigidBody);
        if (rb) rb.linearVelocity = cc.v2(0, 0);
        // Flatten and destroy
        this.node.scaleY = 0.3;
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0.3);
    }
}
