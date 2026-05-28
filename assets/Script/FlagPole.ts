const { ccclass, property } = cc._decorator;

@ccclass
export default class FlagPole extends cc.Component {

    @property poleHeight: number = 220;
    @property scorePerSegment: number = 100;
    @property segments: number = 22;

    private triggered: boolean = false;

    onBeginContact(contact: any, _self: any, other: any) {
        const pc = other.node.getComponent("PlayerController") as any;
        if (!pc || pc.isDead || this.triggered) return;
        this.triggered = true;

        contact.disabled = true;

        // หยุด Mario ติดเสา
        pc.lDown = false;
        pc.rDown = false;
        pc.spaceDown = false;
        pc.isDead = true;
        const rb = other.node.getComponent(cc.RigidBody);
        if (rb) rb.linearVelocity = cc.v2(0, 0);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, pc.onKeyDown, pc);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,   pc.onKeyUp,   pc);

        // คำนวณแต้มจากความสูงที่เกาะ
        const poleWorldY = this.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
        const poleBottom = poleWorldY - this.poleHeight / 2;
        const marioWorldY = other.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
        const heightFromBottom = Math.max(0, marioWorldY - poleBottom);
        const segmentHit = Math.min(this.segments, Math.floor(heightFromBottom / (this.poleHeight / this.segments)) + 1);
        const poleBonus = segmentHit * this.scorePerSegment;

        // แสดง popup คะแนนเสา
        this.showPopup(other.node, `+${poleBonus}`, new cc.Color(255, 255, 0));
        pc.addScore(poleBonus);

        // นับ time bonus แล้วแสดงทีละวินาที
        const gameMgr = pc.gameMgr as any;
        const timeLeft = gameMgr ? Math.ceil(gameMgr.remainTime) : 0;
        const timeBonus = timeLeft * 555;

        this.scheduleOnce(() => {
            this.showTimeBonus(other.node, pc, gameMgr, timeLeft, timeBonus);
        }, 0.8);
    }

    private showTimeBonus(marioNode: cc.Node, pc: any, gameMgr: any, timeLeft: number, totalBonus: number) {
        if (gameMgr) gameMgr.remainTime = 0;

        // แสดง popup เวลาที่เหลือ + bonus
        this.showPopup(marioNode, `Time ${timeLeft} × 555 = +${totalBonus}`, new cc.Color(255, 200, 50));
        pc.addScore(totalBonus);

        // trigger win หลังแสดง popup
        this.scheduleOnce(() => {
            pc.anim.play(pc.isBig ? "Big_win" : "mario_win");
            if (gameMgr) gameMgr.triggerWin();
        }, 1.5);
    }

    private showPopup(refNode: cc.Node, text: string, color: cc.Color) {
        const popup = new cc.Node();
        const label = popup.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 22;
        label.lineHeight = 26;
        label.overflow = cc.Label.Overflow.NONE;
        popup.color = color;
        popup.setPosition(refNode.x, refNode.y + 40);
        refNode.parent.addChild(popup);

        cc.tween(popup)
            .to(1.5, { position: cc.v3(refNode.x, refNode.y + 100, 0), opacity: 0 })
            .call(() => { popup.destroy(); })
            .start();
    }
}
