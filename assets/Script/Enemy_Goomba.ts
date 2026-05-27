const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy_Goomba extends cc.Component {

    @property({ type: cc.AudioClip })
    stompSound: cc.AudioClip = null;

    private moveSpeed: number = 30;
    private isDead: boolean = false;
    private rb: cc.RigidBody = null;
    private canFlip: boolean = true;
    private flipCooldown: number = 0.6;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.rb = this.getComponent(cc.RigidBody);
        if (this.rb) this.rb.allowSleep = false;
    }

    start() {
        if (this.rb) this.rb.linearVelocity = cc.v2(-this.moveSpeed, 0);
    }

    update(_dt: number) {
        if (this.isDead || !this.rb) return;
        this.rb.linearVelocity = cc.v2(-this.moveSpeed, this.rb.linearVelocity.y);
        this.checkEdge();
    }

    private checkEdge() {
        if (!this.canFlip) return;
        const dir = this.moveSpeed < 0 ? -1 : 1;
        const worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));

        // ยิงจากหน้าเท้า (ออกไปข้างหน้า halfW + 2px เผื่อ)
        const fromX = worldPos.x + dir * (this.node.width / 2 + 2);
        const fromY = worldPos.y - this.node.height / 2;
        const from  = cc.v2(fromX, fromY);
        const to    = cc.v2(fromX, fromY - 30);

        const result = cc.director.getPhysicsManager().rayCast(from, to, cc.RayCastType.Closest);
        if (result.length === 0) {
            this.flip();
        }
    }

    private flip() {
        this.moveSpeed *= -1;
        this.canFlip = false;
        this.scheduleOnce(() => { this.canFlip = true; }, this.flipCooldown);
    }

    onBeginContact(contact, self, other) {
        if (this.isDead) return;
        const normal = contact.getWorldManifold().normal;

        if (normal.y === 1 && other.tag === 1) {
            this.stomp();
            return;
        }

        // ชนสิ่งกีดขวางด้านข้าง → กลับทิศ (tag 3=wall, 7=pipe)
        if (normal.x !== 0) {
            this.flip();
        }

        if (other.node.name === "Lower_bound") {
            this.node.destroy();
        }
    }

    private stomp() {
        this.isDead = true;
        if (this.stompSound) cc.audioEngine.playEffect(this.stompSound, false);
        if (this.rb) this.rb.linearVelocity = cc.v2(0, 0);

        // แสดง +100 popup
        this.showScorePopup();

        // แฟบแล้วหาย
        cc.tween(this.node)
            .to(0.1, { scaleY: 0.2 })
            .delay(0.3)
            .call(() => { this.node.destroy(); })
            .start();
    }

    private showScorePopup() {
        let popupNode = new cc.Node();
        let label = popupNode.addComponent(cc.Label);
        label.string = "+100";
        label.fontSize = 28;
        label.lineHeight = 32;
        popupNode.color = new cc.Color(255, 255, 0);
        popupNode.setPosition(this.node.x, this.node.y + 40);
        this.node.parent.addChild(popupNode);

        cc.tween(popupNode)
            .to(0.6, { position: cc.v3(this.node.x, this.node.y + 80, 0), opacity: 0 })
            .call(() => { popupNode.destroy(); })
            .start();
    }
}
