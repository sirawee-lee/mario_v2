const { ccclass, property } = cc._decorator;

@ccclass
export default class PiranhaPlant extends cc.Component {

    @property riseHeight: number = 48;   // พิกเซลที่โผล่ขึ้นมา
    @property riseTime: number  = 0.6;   // วินาทีขึ้น/ลง
    @property waitTopTime: number  = 1.0;   // วินาทีค้างข้างบน
    @property waitBottomTime: number = 2.0;  // วินาทีหุบอยู่ในท่อ

    private startY: number = 0;
    private anim: cc.Animation = null;
    private damageCooldown: number = 0;

    onLoad() {
        this.startY = this.node.y;
        this.anim = this.getComponent(cc.Animation);
        const col = this.getComponent(cc.PhysicsBoxCollider);
        if (col) col.enabled = false;
    }

    start() {
        if (this.anim) this.anim.play("flower_idle");
        this.scheduleOnce(() => this.rise(), this.waitBottomTime);
    }

    private rise() {
        const col = this.getComponent(cc.PhysicsBoxCollider);
        cc.tween(this.node)
            .call(() => { if (col) col.enabled = true; })
            .to(this.riseTime, { y: this.startY + this.riseHeight }, { easing: "sineInOut" })
            .delay(this.waitTopTime)
            .to(this.riseTime, { y: this.startY }, { easing: "sineInOut" })
            .call(() => { if (col) col.enabled = false; })
            .delay(this.waitBottomTime)
            .call(() => this.rise())
            .start();
    }

    update(dt: number) {
        if (this.damageCooldown > 0) {
            this.damageCooldown -= dt;
            return;
        }

        const col = this.getComponent(cc.PhysicsBoxCollider);
        if (!col || !col.enabled) return;

        const marioNode = cc.find("Canvas/Mario");
        if (!marioNode) return;

        const myWorld = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        // ยังไม่โผล่พ้นจุดเริ่มต้น (node.y > startY + threshold) → ไม่ damage
        if (this.node.y <= this.startY + 4) return;

        const mWorld = marioNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const hw = (this.node.width  + marioNode.width)  / 2 - 4;
        const hh = (this.node.height + marioNode.height) / 2 - 4;

        if (Math.abs(myWorld.x - mWorld.x) < hw && Math.abs(myWorld.y - mWorld.y) < hh) {
            const pc = marioNode.getComponent("PlayerController") as any;
            if (pc) {
                pc.takeDamage();
                this.damageCooldown = 2.0;
            }
        }
    }

    onBeginContact(_contact: any, _self: any, other: any) {
        if (other.tag === 1) {
            const pc = other.node.getComponent("PlayerController") as any;
            if (pc) pc.takeDamage();
        }
    }
}
