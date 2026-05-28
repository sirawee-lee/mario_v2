import GameData from "./GameData";

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

        const gameMgr = pc.gameMgr as any;

        // หยุด GameManager timer ทันที ป้องกัน triggerGameover
        if (gameMgr) {
            gameMgr.isWin = true;
            gameMgr.remainTime = gameMgr.remainTime; // อ่านค่าก่อน freeze
        }

        // หยุด Mario
        pc.lDown = false;
        pc.rDown = false;
        pc.spaceDown = false;
        pc.isDead = true;
        const rb = other.node.getComponent(cc.RigidBody);
        if (rb) rb.linearVelocity = cc.v2(0, 0);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, pc.onKeyDown, pc);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,   pc.onKeyUp,   pc);

        // คำนวณคะแนนเสา
        const poleWorldY = this.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
        const poleBottom = poleWorldY - this.poleHeight / 2;
        const marioWorldY = other.node.convertToWorldSpaceAR(cc.v2(0, 0)).y;
        const heightFromBottom = Math.max(0, marioWorldY - poleBottom);
        const segmentHit = Math.min(this.segments, Math.floor(heightFromBottom / (this.poleHeight / this.segments)) + 1);
        const poleBonus = segmentHit * this.scorePerSegment;

        pc.addScore(poleBonus);
        this.showPopup(other.node, `+${poleBonus}`, new cc.Color(255, 255, 0));

        // อ่าน timeLeft ก่อน remainTime เป็น 0
        const timeLeft = gameMgr ? Math.ceil(gameMgr.remainTime) : 0;

        // หยุดเวลาหลังอ่านค่าแล้ว
        if (gameMgr) gameMgr.remainTime = 0;

        this.scheduleOnce(() => {
            this.showTimeBonus(other.node, pc, gameMgr, timeLeft);
        }, 0.8);
    }

    private showTimeBonus(marioNode: cc.Node, pc: any, gameMgr: any, timeLeft: number) {
        const totalBonus = timeLeft * 10;

        const popup = this.makeLabel(
            marioNode.parent,
            `Time ${timeLeft} × 10 = +${totalBonus}`,
            marioNode.x, marioNode.y + 60
        );

        // นับ score ทีละ tick ใน 4 วินาที
        if (timeLeft > 0) {
            const interval = 4.0 / timeLeft;
            let remaining = timeLeft;
            const tick = () => {
                if (remaining <= 0) return;
                pc.addScore(10);
                remaining--;
            };
            this.schedule(tick, interval, timeLeft - 1);
        }

        // รอ score นับจบ (4 วิ) + 1 วิ buffer แล้วเข้า scene ถัดไป
        this.scheduleOnce(() => {
            popup.destroy();
            cc.audioEngine.stopMusic();
            if (gameMgr && gameMgr.victorySound) {
                cc.audioEngine.playMusic(gameMgr.victorySound, false);
            }
            const nextScene = (GameData.inst && GameData.inst.level >= 2) ? "ThanksForPlaying" : "LevelClear";
            cc.director.loadScene(nextScene);
        }, 5);
    }

    private makeLabel(parent: cc.Node, text: string, x: number, y: number): cc.Node {
        const offsets = [[-2,-2],[2,-2],[-2,2],[2,2]];
        for (const [ox, oy] of offsets) {
            const shadow = new cc.Node();
            const sl = shadow.addComponent(cc.Label);
            sl.string = text;
            sl.fontSize = 28;
            sl.lineHeight = 34;
            sl.overflow = cc.Label.Overflow.NONE;
            shadow.color = new cc.Color(0, 0, 0);
            shadow.setPosition(x + ox, y + oy);
            parent.addChild(shadow, 9);
        }

        const node = new cc.Node();
        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 28;
        label.lineHeight = 34;
        label.overflow = cc.Label.Overflow.NONE;
        node.color = new cc.Color(255, 165, 0);
        node.setPosition(x, y);
        parent.addChild(node, 10);

        return node;
    }

    private showPopup(refNode: cc.Node, text: string, color: cc.Color) {
        const node = new cc.Node();
        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 24;
        label.lineHeight = 28;
        label.overflow = cc.Label.Overflow.NONE;
        node.color = color;
        node.setPosition(refNode.x, refNode.y + 40);
        refNode.parent.addChild(node, 10);

        cc.tween(node)
            .by(0.5, { position: cc.v3(0, 30, 0) })
            .start();
    }
}
