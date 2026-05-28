import GameData from "./GameData";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {

    // --- Sprites ---
    @property(cc.SpriteFrame) smallMarioSprite: cc.SpriteFrame | null = null;
    @property(cc.SpriteFrame) bigMarioSprite:   cc.SpriteFrame | null = null;

    // --- Sounds ---
    @property({ type: cc.AudioClip }) jumpSound:     cc.AudioClip = null;
    @property({ type: cc.AudioClip }) dieSound:      cc.AudioClip = null;
    @property({ type: cc.AudioClip }) growSound:     cc.AudioClip = null;
    @property({ type: cc.AudioClip }) shrinkSound:   cc.AudioClip = null;
    @property({ type: cc.AudioClip }) stompSound:    cc.AudioClip = null;
    @property({ type: cc.AudioClip }) coinSound:     cc.AudioClip = null;
    @property({ type: cc.AudioClip }) gameoverSound: cc.AudioClip = null;

    // --- References ---
    @property(cc.Node)    mainCamera: cc.Node | null = null;
    @property(GameManager) gameMgr:  GameManager = null;

    // ความกว้าง TileMap จริง (ดูจาก TileMap node > Size W)
    @property mapPixelWidth: number = 3200;

    // --- State ---
    isBig      = false;
    lives      = 3;
    score      = 0;
    coins      = 0;

    private anim:      cc.Animation = null;
    private rb:        cc.RigidBody = null;
    private rebornPos: cc.Vec2      = null;

    // ขอบ map ใน Canvas space (คำนวณจาก TileMap position)
    private mapLeft:  number = 0;
    private mapRight: number = 0;

    private lDown     = false;
    private rDown     = false;
    private spaceDown = false;
    private onGround  = false;
    private isDead    = false;
    private invincible = false;
    private shrinking  = false;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -640);
        this.anim      = this.getComponent(cc.Animation);
        this.rb        = this.getComponent(cc.RigidBody);
        this.rebornPos = cc.v2(this.node.x, this.node.y);

        // friction = 0 ป้องกัน Mario ติดข้างกำแพง/ท่อตอนกระโดด
        const col = this.getComponent(cc.PhysicsBoxCollider);
        if (col) col.friction = 0;

        // คำนวณขอบ map จาก TileMap node (anchor 0.5)
        const tileMap = cc.find("Canvas/TileMap");
        if (tileMap) {
            this.mapLeft  = tileMap.x - this.mapPixelWidth / 2;
            this.mapRight = tileMap.x + this.mapPixelWidth / 2;
        }

        if (GameData.inst) {
            this.lives = GameData.inst.lives;
            this.score = GameData.inst.score;
            this.coins = GameData.inst.coins;
        }
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,   this.onKeyUp,   this);
        this.anim.play("idle");
        this.updateUI();
        this.updateCamera();
    }

    // ===== Input =====
    onKeyDown(event) {
        if (this.isDead) return;
        const k = event.keyCode;
        if (k === cc.macro.KEY.left || k === 65) {
            this.lDown = true; this.rDown = false;
            this.node.scaleX = -Math.abs(this.node.scaleX);
            this.anim.play(this.isBig ? "Big_move" : "move");
        } else if (k === cc.macro.KEY.right || k === 68) {
            this.rDown = true; this.lDown = false;
            this.node.scaleX = Math.abs(this.node.scaleX);
            this.anim.play(this.isBig ? "Big_move" : "move");
        } else if (k === cc.macro.KEY.space || k === cc.macro.KEY.up || k === 87) {
            this.spaceDown = true;
        }
    }

    onKeyUp(event) {
        const k = event.keyCode;
        if (k === cc.macro.KEY.left  || k === 65) {
            this.lDown = false;
            if (!this.rDown) this.anim.play(this.isBig ? "Big_idle" : "idle");
        } else if (k === cc.macro.KEY.right || k === 68) {
            this.rDown = false;
            if (!this.lDown) this.anim.play(this.isBig ? "Big_idle" : "idle");
        } else if (k === cc.macro.KEY.space || k === cc.macro.KEY.up || k === 87) {
            this.spaceDown = false;
        }
    }

    // ===== Update =====
    update(_dt: number) {
        if (this.isDead) return;

        let vx = 0;
        if (this.lDown)      vx = -120;
        else if (this.rDown) vx = 120;

        // clamp Mario ไม่ให้เกินขอบ map
        const halfW = cc.winSize.width / 2;
        const minX  = this.mapLeft  + halfW;
        const maxX  = this.mapRight - halfW;
        if ((vx < 0 && this.node.x <= minX) || (vx > 0 && this.node.x >= maxX)) vx = 0;

        // ป้องกันติดข้างกำแพง
        const curVx = this.rb.linearVelocity.x;
        if ((vx > 0 && curVx < -10) || (vx < 0 && curVx > 10)) vx = 0;

        this.rb.linearVelocity = cc.v2(vx, this.rb.linearVelocity.y);

        // เช็คพื้นด้วย raycast — แม่นยำกว่า onEndContact
        this.checkGround();

        if (this.spaceDown && this.onGround) this.jump();

        this.updateCamera();
    }

    private checkGround() {
        const worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const pm = cc.director.getPhysicsManager();
        const footY  = worldPos.y - 8;
        const checkY = worldPos.y - 12;
        // ยิงกลาง + ซ้าย + ขวา — ถ้าจุดกลางมีพื้น หรือ ทั้งซ้ายและขวามีพื้น ถือว่าอยู่บนพื้น
        const hit = (ox: number) => {
            const r = pm.rayCast(cc.v2(worldPos.x + ox, footY), cc.v2(worldPos.x + ox, checkY), cc.RayCastType.Closest);
            return r && r.length > 0 && r[0].collider.tag !== 2 && r[0].collider.tag !== 5;
        };
        const left  = hit(-3);
        const right = hit(3);
        this.onGround = left && right;
    }

    // Camera follow Mario โดย clamp ไม่ให้เห็นขอบดำ
    private updateCamera() {
        if (!this.mainCamera) return;
        const halfW = cc.winSize.width / 2;
        // clamp X: ไม่เลยขอบซ้าย/ขวาของ map
        const camX = Math.max(this.mapLeft + halfW, Math.min(this.mapRight - halfW, this.node.x));
        this.mainCamera.x = camX;
        this.mainCamera.y = 0; // Y คงที่กลางจอเสมอ (Canvas origin Y=0 = กลาง)
    }

    // ===== Jump =====
    private jump() {
        this.onGround = false;
        this.anim.play(this.isBig ? "Big_jump" : "mario_jump");
        if (this.jumpSound) cc.audioEngine.playEffect(this.jumpSound, false);
        this.rb.linearVelocity = cc.v2(0, 400);
    }

    // ===== Damage / Die =====
    takeDamage() {
        if (this.invincible || this.shrinking) return;
        if (this.isBig) {
            this.shrinking = true;
            this.isBig = false;
            this.anim.play("mario_shrink");
            if (this.smallMarioSprite) this.getComponent(cc.Sprite).spriteFrame = this.smallMarioSprite;
            if (this.shrinkSound) cc.audioEngine.playEffect(this.shrinkSound, false);
            this.scheduleOnce(() => { this.shrinking = false; }, 1.5);
        } else {
            this.die();
        }
    }

    private die() {
        if (this.invincible) return;
        this.isDead = true;
        this.lDown = this.rDown = this.spaceDown = false;
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,   this.onKeyUp,   this);

        this.anim.play("mario_die");
        this.node.getComponent(cc.PhysicsBoxCollider).enabled = false;
        this.rb.linearVelocity = cc.v2(0, 900);
        cc.audioEngine.pauseMusic();
        if (this.dieSound) cc.audioEngine.playEffect(this.dieSound, false);

        if (this.lives <= 1) {
            this.lives = 0;
            this.syncGameData();
            this.updateUI();
            if (this.gameoverSound) cc.audioEngine.playEffect(this.gameoverSound, false);
            this.scheduleOnce(() => cc.director.loadScene("Gameover"), 3);
        } else {
            this.lives--;
            this.syncGameData();
            this.updateUI();
            this.scheduleOnce(() => this.respawn(), 2);
        }
    }

    private respawn() {
        this.isDead = false;
        this.invincible = true;
        this.isBig = false;
        this.node.position = cc.v3(this.rebornPos.x, this.rebornPos.y, 0);
        this.node.getComponent(cc.PhysicsBoxCollider).enabled = true;
        this.rb.linearVelocity = cc.v2(0, 0);
        if (this.smallMarioSprite) this.getComponent(cc.Sprite).spriteFrame = this.smallMarioSprite;
        this.anim.play("idle");
        cc.audioEngine.resumeMusic();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,   this.onKeyUp,   this);
        this.scheduleOnce(() => { this.invincible = false; }, 2);
    }

    // ===== Grow =====
    grow() {
        if (this.isBig) return;
        this.isBig = true;
        this.anim.play("mario_grow");
        if (this.bigMarioSprite) this.getComponent(cc.Sprite).spriteFrame = this.bigMarioSprite;
        if (this.growSound) cc.audioEngine.playEffect(this.growSound, false);
        this.addScore(200);
    }

    // ===== Score / Coins =====
    addScore(pts: number) {
        this.score += pts;
        this.syncGameData();
        this.updateUI();
    }

    addCoin() {
        this.coins++;
        if (this.coinSound) cc.audioEngine.playEffect(this.coinSound, false);
        this.addScore(50);
    }

    // ===== Collision =====
    onBeginContact(contact: any, _self: any, other: any) {
        const normal = contact.getWorldManifold().normal;

        if (normal.y === -1 && other.tag === 2) {
            if (this.stompSound) cc.audioEngine.playEffect(this.stompSound, false);
            this.rb.linearVelocity = cc.v2(this.rb.linearVelocity.x, 400);
            this.onGround = false;
            this.addScore(100);
            return;
        }

        if (other.tag === 5) { this.grow(); other.node.destroy(); }

        if (normal.y === -1) {
            if (other.tag !== 2 && other.tag !== 5 && other.tag !== 8 && other.node.name !== "Lower_bound") {
                this.onGround = true;
                if (!this.lDown && !this.rDown)
                    this.anim.play(this.isBig ? "Big_idle" : "idle");
            }
            if (other.node.name === "Lower_bound") this.die();
            if (other.tag === 8) { this.addCoin(); other.node.destroy(); }
        }

        if (normal.y === 1 && other.tag === 4) {
            const qblock = other.node.getComponent("Qblock");
            if (qblock) (qblock as any).onHit();
        }

        if (Math.abs(normal.y) < 0.5 && other.tag === 2) this.takeDamage();

        // tag=6 (flagpole) จัดการโดย FlagPole.ts
    }

    onEndContact(_contact: any, _self: any, _other: any) {
        // onGround ถูกจัดการโดย checkGround() ใน update แล้ว
    }

    // ===== Helpers =====
    private syncGameData() {
        if (GameData.inst) {
            GameData.inst.lives = this.lives;
            GameData.inst.score = this.score;
            GameData.inst.coins = this.coins;
        }
    }

    private updateUI() {
        if (this.gameMgr) {
            this.gameMgr.updateScoreUI(this.score);
            this.gameMgr.updateLivesUI(this.lives);
            this.gameMgr.updateCoinsUI(this.coins);
        }
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,   this.onKeyUp,   this);
    }
}
