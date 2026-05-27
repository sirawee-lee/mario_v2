import GameData from "./GameData";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {

    // --- Sprites ---
    @property(cc.SpriteFrame)
    smallMarioSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bigMarioSprite: cc.SpriteFrame = null;

    // --- Sounds ---
    @property({ type: cc.AudioClip }) jumpSound: cc.AudioClip = null;
    @property({ type: cc.AudioClip }) dieSound: cc.AudioClip = null;
    @property({ type: cc.AudioClip }) growSound: cc.AudioClip = null;
    @property({ type: cc.AudioClip }) shrinkSound: cc.AudioClip = null;
    @property({ type: cc.AudioClip }) stompSound: cc.AudioClip = null;
    @property({ type: cc.AudioClip }) coinSound: cc.AudioClip = null;
    @property({ type: cc.AudioClip }) gameoverSound: cc.AudioClip = null;

    // --- References ---
    @property(cc.Node) mainCamera: cc.Node = null;
    @property(GameManager) gameMgr: GameManager = null;

    // --- State ---
    isBig: boolean = false;
    lives: number = 3;
    score: number = 0;
    coins: number = 0;

    private anim: cc.Animation = null;
    private rb: cc.RigidBody = null;
    private rebornPos: cc.Vec2 = null;

    private lDown: boolean = false;
    private rDown: boolean = false;
    private spaceDown: boolean = false;
    private onGround: boolean = false;
    private isDead: boolean = false;
    private invincible: boolean = false;
    private shrinking: boolean = false;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.anim = this.getComponent(cc.Animation);
        this.rb   = this.getComponent(cc.RigidBody);
        this.rebornPos = cc.v2(this.node.x, this.node.y);

        // โหลดชีวิตจาก GameData
        if (GameData.inst) {
            this.lives = GameData.inst.lives;
            this.score = GameData.inst.score;
            this.coins = GameData.inst.coins;
        } else {
            this.lives = 3;
        }
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,   this.onKeyUp,   this);
        this.anim.play("idle");
        this.updateUI();
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
        if (k === cc.macro.KEY.left || k === 65) {
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
    update(dt) {
        if (this.isDead) return;

        let speed = 0;
        if (this.lDown)       speed = -250;
        else if (this.rDown)  speed = 250;
        this.node.x += speed * dt;

        if (this.spaceDown && this.onGround) this.jump();

        if (this.mainCamera) this.mainCamera.x = this.node.x;
    }

    // ===== Jump =====
    private jump() {
        this.onGround = false;
        this.anim.play(this.isBig ? "Big_jump" : "mario_jump");
        if (this.jumpSound) cc.audioEngine.playEffect(this.jumpSound, false);
        this.rb.linearVelocity = cc.v2(0, 750);
    }

    // ===== Damage / Die =====
    takeDamage() {
        if (this.invincible || this.shrinking) return;
        if (this.isBig) {
            // ตัวเล็กลง
            this.shrinking = true;
            this.isBig = false;
            this.anim.play("mario_shrink");
            this.getComponent(cc.Sprite).spriteFrame = this.smallMarioSprite;
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

        this.lives--;
        this.syncGameData();
        this.updateUI();

        if (this.lives <= 0) {
            if (this.gameoverSound) cc.audioEngine.playEffect(this.gameoverSound, false);
            this.scheduleOnce(() => { cc.director.loadScene("Gameover"); }, 3);
        } else {
            this.scheduleOnce(() => { this.respawn(); }, 2);
        }
    }

    private respawn() {
        this.isDead = false;
        this.invincible = true;
        this.isBig = false;
        this.node.position = cc.v3(this.rebornPos.x, this.rebornPos.y, 0);
        this.node.getComponent(cc.PhysicsBoxCollider).enabled = true;
        this.rb.linearVelocity = cc.v2(0, 0);
        this.getComponent(cc.Sprite).spriteFrame = this.smallMarioSprite;
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
        this.getComponent(cc.Sprite).spriteFrame = this.bigMarioSprite;
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
    onBeginContact(contact, self, other) {
        const normal = contact.getWorldManifold().normal;

        // เหยียบ enemy จากบน
        if (normal.y === -1 && other.tag === 2) {
            if (this.stompSound) cc.audioEngine.playEffect(this.stompSound, false);
            this.rb.linearVelocity = cc.v2(this.rb.linearVelocity.x, 400);
            this.onGround = false;
            this.addScore(100);
            return;
        }

        // ลงพื้น
        if (normal.y === -1) {
            if (other.tag === 3 || other.node.name === "Ground") {
                this.onGround = true;
                if (!this.lDown && !this.rDown) {
                    this.anim.play(this.isBig ? "Big_idle" : "idle");
                }
            }
            // ตกหลุม
            if (other.node.name === "Lower_bound") this.die();
            // coin
            if (other.tag === 8) { this.addCoin(); other.node.destroy(); }
            // mushroom
            if (other.tag === 5) { this.grow(); other.node.destroy(); }
        }

        // โดน Q-block จากล่าง
        if (normal.y === 1 && other.tag === 4) {
            let qblock = other.node.getComponent("Qblock");
            if (qblock) (qblock as any).onHit();
        }

        // ชน enemy ด้านข้าง
        if (Math.abs(normal.y) < 0.5 && other.tag === 2) {
            this.takeDamage();
        }

        // ตกหลุม (ด้านข้าง)
        if (other.node.name === "Lower_bound") this.die();

        // ถึงธง goal
        if (other.tag === 6) {
            contact.disabled = true;
            this.lDown = this.rDown = false;
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,   this.onKeyUp,   this);
            this.anim.play(this.isBig ? "Big_win" : "mario_win");
            if (this.gameMgr) this.gameMgr.triggerWin();
        }
    }

    onEndContact(contact, self, other) {
        if (other.tag === 3 || other.node.name === "Ground") {
            this.onGround = false;
        }
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
