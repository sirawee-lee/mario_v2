const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy_Goomba extends cc.Component {

    @property({ type: cc.AudioClip })
    stompSound: cc.AudioClip = null;

    private moveSpeed: number = 80;
    private isDead: boolean = false;
    private rb: cc.RigidBody = null;

    onLoad() {
        this.rb = this.getComponent(cc.RigidBody);
    }

    update(dt) {
        if (this.isDead) return;
        this.node.x -= this.moveSpeed * dt;
    }

    onBeginContact(contact, self, other) {
        if (this.isDead) return;
        const normal = contact.getWorldManifold().normal;

        // โดนเหยียบจากบน — ตาย
        if (normal.y === 1 && other.tag === 1) {
            this.stomp();
            return;
        }

        // ชนกำแพง — กลับทิศ
        if (normal.x !== 0 && (other.tag === 3 || other.node.name === "Ground")) {
            this.moveSpeed *= -1;
            this.node.scaleX *= -1;
        }

        // ตกหลุม
        if (other.node.name === "Lower_bound") {
            this.node.destroy();
        }
    }

    private stomp() {
        this.isDead = true;
        if (this.stompSound) cc.audioEngine.playEffect(this.stompSound, false);
        if (this.rb) this.rb.linearVelocity = cc.v2(0, 0);
        this.node.scaleY = 0.3;
        this.scheduleOnce(() => { this.node.destroy(); }, 0.4);
    }
}
