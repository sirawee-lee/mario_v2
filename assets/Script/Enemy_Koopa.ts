const { ccclass, property } = cc._decorator;

// tag=9 = Koopa (walking), tag=10 = shell (sliding)

type KoopaState = "walk" | "shell_idle" | "shell_move";

@ccclass
export default class Enemy_Koopa extends cc.Component {

    @property({ type: cc.AudioClip }) stompSound: cc.AudioClip = null;

    private state: KoopaState = "walk";
    private moveSpeed: number = 40;
    private shellSpeed: number = 200;
    private rb: cc.RigidBody = null;
    private anim: cc.Animation = null;
    private canFlip: boolean = true;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.rb = this.getComponent(cc.RigidBody);
        if (this.rb) this.rb.allowSleep = false;
        this.anim = this.getComponent(cc.Animation);
    }

    start() {
        if (this.rb) this.rb.linearVelocity = cc.v2(-this.moveSpeed, 0);
        if (this.anim) this.anim.play("koopa_walk");
    }

    update(_dt: number) {
        if (!this.rb) return;

        if (this.state === "walk") {
            this.rb.linearVelocity = cc.v2(-this.moveSpeed, this.rb.linearVelocity.y);
            this.checkEdge();
        } else if (this.state === "shell_move") {
            this.rb.linearVelocity = cc.v2(this.shellSpeed, this.rb.linearVelocity.y);
        }
        // shell_idle: ไม่บังคับ velocity
    }

    private checkEdge() {
        if (!this.canFlip) return;
        const dir = this.moveSpeed > 0 ? -1 : 1;
        const worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const fromX = worldPos.x + dir * (this.node.width / 2 + 2);
        const fromY = worldPos.y - this.node.height / 2;
        const result = cc.director.getPhysicsManager().rayCast(
            cc.v2(fromX, fromY), cc.v2(fromX, fromY - 30), cc.RayCastType.Closest
        );
        if (result.length === 0) this.flip();
    }

    private flip() {
        this.moveSpeed *= -1;
        this.canFlip = false;
        this.scheduleOnce(() => { this.canFlip = true; }, 0.4);
    }

    onBeginContact(contact: any, _self: any, other: any) {
        const normal = contact.getWorldManifold().normal;

        // Mario เหยียบ
        if (normal.y === 1 && other.tag === 1) {
            if (this.state === "walk") {
                this.firstStomp(other.node);
            } else if (this.state === "shell_idle") {
                this.kickShell(other.node);
            } else if (this.state === "shell_move") {
                // หยุดกระดอง
                this.state = "shell_idle";
                this.shellSpeed = 0;
                this.rb.linearVelocity = cc.v2(0, this.rb.linearVelocity.y);
                if (this.anim) this.anim.play("koopa_shell");
            }
            return;
        }

        // Mario ชนด้านข้าง (ไม่ใช่กระโดดเหยียบ) → ทำ damage ทุก state
        if (other.tag === 1 && Math.abs(normal.x) > 0.5) {
            const pc = other.node.getComponent("PlayerController") as any;
            if (pc) pc.takeDamage();
            return;
        }

        // ตกหลุม → destroy ทุก state
        if (other.node.name === "Lower_bound") {
            this.node.destroy();
            return;
        }

        // coin/sensor → ทะลุผ่านเสมอ
        if (other.tag === 8 || other.sensor) {
            contact.disabled = true;
            return;
        }

        // กระดองซิ่งชน Goomba (tag=2) → Goomba ตาย +100
        if (this.state === "shell_move" && other.tag === 2) {
            const goomba = other.node.getComponent("Enemy_Goomba") as any;
            if (goomba) goomba.killByShell();
            return;
        }

        // กระดองซิ่งชน Koopa ตัวอื่น (tag=9 หรือ 10) → ตาย +200
        if (this.state === "shell_move" && (other.tag === 9 || other.tag === 10)) {
            const koopa = other.node.getComponent("Enemy_Koopa") as any;
            if (koopa) koopa.killByShell();
            return;
        }

        // Koopa เดินชนกันเองให้ทะลุ
        if (this.state === "walk" && (other.tag === 9 || other.tag === 10)) {
            contact.disabled = true;
            return;
        }

        // กระดองเคลื่อนที่ชนผนัง/ท่อ → กระเด้ง
        if (this.state === "shell_move" && normal.x !== 0) {
            this.shellSpeed *= -1;
            return;
        }

        // เดินชนผนัง/ท่อ → กลับทิศ
        if (this.state === "walk" && normal.x !== 0 && other.tag !== 1) {
            this.flip();
        }
    }

    killByShell() {
        const marioNode = cc.find("Canvas/Mario");
        if (marioNode) {
            const pc = marioNode.getComponent("PlayerController") as any;
            if (pc) pc.addScore(200);
        }
        this.showScorePopup(200);
        this.node.destroy();
    }

    private firstStomp(marioNode: cc.Node) {
        // หุบเป็นกระดอง
        this.state = "shell_idle";
        this.moveSpeed = 0;
        this.rb.linearVelocity = cc.v2(0, this.rb.linearVelocity.y);
        if (this.anim) this.anim.play("koopa_shell");
        if (this.stompSound) cc.audioEngine.playEffect(this.stompSound, false);

        this.showScorePopup(200);

        const pc = marioNode.getComponent("PlayerController") as any;
        if (pc) {
            pc.addScore(200);
            pc.rb.linearVelocity = cc.v2(pc.rb.linearVelocity.x, 300);
        }

        // อัปเดต collider tag เป็น shell_idle (tag=10)
        const col = this.getComponent(cc.PhysicsBoxCollider);
        if (col) col.tag = 10;
    }

    private kickShell(marioNode: cc.Node) {
        // Mario อยู่ทางไหน กระดองวิ่งออกฝั่งตรงข้าม
        const marioX = marioNode.convertToWorldSpaceAR(cc.v2(0, 0)).x;
        const myX    = this.node.convertToWorldSpaceAR(cc.v2(0, 0)).x;
        this.shellSpeed = marioX < myX ? 200 : -200;

        this.state = "shell_move";
        if (this.anim) this.anim.play("koopa_shell");

        const col = this.getComponent(cc.PhysicsBoxCollider);
        if (col) col.tag = 10;

        const pc = marioNode.getComponent("PlayerController") as any;
        if (pc) {
            pc.rb.linearVelocity = cc.v2(pc.rb.linearVelocity.x, 300);
        }
    }

    private showScorePopup(pts: number) {
        const popup = new cc.Node();
        const label = popup.addComponent(cc.Label);
        label.string = `+${pts}`;
        label.fontSize = 28;
        label.lineHeight = 32;
        popup.color = new cc.Color(255, 255, 0);
        popup.setPosition(this.node.x, this.node.y + 40);
        this.node.parent.addChild(popup);
        cc.tween(popup)
            .to(0.6, { position: cc.v3(this.node.x, this.node.y + 80, 0), opacity: 0 })
            .call(() => { popup.destroy(); })
            .start();
    }
}
