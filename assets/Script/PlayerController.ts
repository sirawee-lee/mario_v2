const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
  @property(cc.SpriteFrame)
  bigMarioSprite: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  smallMarioSprite: cc.SpriteFrame = null;

  @property({ type: cc.AudioClip })
  jumpSound: cc.AudioClip = null;

  @property({ type: cc.AudioClip })
  dieSound: cc.AudioClip = null;

  @property({ type: cc.AudioClip })
  growSound: cc.AudioClip = null;

  @property({ type: cc.AudioClip })
  shrinkSound: cc.AudioClip = null;

  @property({ type: cc.AudioClip })
  stompSound: cc.AudioClip = null;

  @property({ type: cc.AudioClip })
  coinSound: cc.AudioClip = null;

  @property({ type: cc.AudioClip })
  gameoverSound: cc.AudioClip = null;

  @property({ type: cc.AudioClip })
  powerUpAppearSound: cc.AudioClip = null;

  @property({ type: cc.Node })
  mainCamera: cc.Node = null;

  @property({ type: cc.Node })
  lifeContainer: cc.Node = null;

  @property(cc.Prefab)
  lifePrefab: cc.Prefab = null;

  @property([cc.Prefab])
  itemPrefabs: cc.Prefab[] = [];

  isBig: boolean = false;
  lives: number = 3;
  score: number = 0;
  coins: number = 0;

  private anim: cc.Animation = null;
  private rebornPos: cc.Vec2 = null;
  private lDown: boolean = false;
  private rDown: boolean = false;
  private spaceDown: boolean = false;
  private onGround: boolean = false;
  private isDead: boolean = false;
  private shrinking: boolean = false;
  private invincible: boolean = false;

  private coinLabel: cc.Label = null;
  private scoreLabel: cc.Label = null;

  onLoad() {
    cc.director.getPhysicsManager().enabled = true;
    this.anim = this.getComponent(cc.Animation);
    this.rebornPos = this.node.position.clone();
    this.lives = 3;
    this.drawLives();
  }

  start() {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

    let coinNode = cc.find("Canvas/Main Camera/UI/TopBar/Coins/number");
    let scoreNode = cc.find("Canvas/Main Camera/UI/TopBar/Score/value");
    if (coinNode) this.coinLabel = coinNode.getComponent(cc.Label);
    if (scoreNode) this.scoreLabel = scoreNode.getComponent(cc.Label);

    this.anim.play("idle");
  }

  drawLives() {
    if (!this.lifeContainer || !this.lifePrefab) return;
    this.lifeContainer.removeAllChildren();
    for (let i = 0; i < this.lives; i++) {
      let life = cc.instantiate(this.lifePrefab);
      this.lifeContainer.addChild(life);
      life.setPosition(20 + 30 * i, 0);
      life.scaleX = 0.3;
      life.scaleY = 0.3;
    }
  }

  onKeyDown(event) {
    if (this.isDead) return;
    if (event.keyCode === cc.macro.KEY.left || event.keyCode === 65) {
      this.lDown = true;
      this.rDown = false;
      this.node.scaleX = -Math.abs(this.node.scaleX);
      this.playMoveAnim();
    } else if (event.keyCode === cc.macro.KEY.right || event.keyCode === 68) {
      this.rDown = true;
      this.lDown = false;
      this.node.scaleX = Math.abs(this.node.scaleX);
      this.playMoveAnim();
    } else if (
      event.keyCode === cc.macro.KEY.space ||
      event.keyCode === cc.macro.KEY.up ||
      event.keyCode === 87
    ) {
      this.spaceDown = true;
    }
  }

  onKeyUp(event) {
    if (event.keyCode === cc.macro.KEY.left || event.keyCode === 65) {
      this.lDown = false;
      if (!this.rDown) this.playIdleAnim();
    } else if (event.keyCode === cc.macro.KEY.right || event.keyCode === 68) {
      this.rDown = false;
      if (!this.lDown) this.playIdleAnim();
    } else if (
      event.keyCode === cc.macro.KEY.space ||
      event.keyCode === cc.macro.KEY.up ||
      event.keyCode === 87
    ) {
      this.spaceDown = false;
    }
  }

  private playMoveAnim() {
    if (this.isBig) this.anim.play("Big_move");
    else this.anim.play("move");
  }

  private playIdleAnim() {
    if (this.isBig) this.anim.play("Big_idle");
    else this.anim.play("idle");
  }

  private playJumpAnim() {
    if (this.isBig) this.anim.play("Big_jump");
    else this.anim.play("mario_jump");
  }

  private jump() {
    this.onGround = false;
    this.playJumpAnim();
    cc.audioEngine.playEffect(this.jumpSound, false);
    this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 200);
  }

  private die() {
    if (this.invincible) return;
    this.isDead = true;
    this.lDown = this.rDown = this.spaceDown = false;
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

    this.anim.play("mario_die");
    this.node.getComponent(cc.PhysicsBoxCollider).enabled = false;
    this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1000);

    cc.audioEngine.pauseMusic();
    cc.audioEngine.playEffect(this.dieSound, false);

    this.lives--;
    this.drawLives();

    if (this.lives <= 0) {
      cc.audioEngine.playEffect(this.gameoverSound, false);
      this.scheduleOnce(() => {
        cc.director.loadScene("Gameover");
      }, 3);
    } else {
      this.scheduleOnce(() => {
        this.respawn();
      }, 2);
    }
  }

  private respawn() {
    this.isDead = false;
    this.invincible = true;
    this.node.position = cc.v3(this.rebornPos.x, this.rebornPos.y, 0);
    this.node.getComponent(cc.PhysicsBoxCollider).enabled = true;
    this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
    this.isBig = false;
    this.getComponent(cc.Sprite).spriteFrame = this.smallMarioSprite;
    this.playIdleAnim();
    cc.audioEngine.resumeMusic();
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    this.scheduleOnce(() => {
      this.invincible = false;
    }, 2);
  }

  private takeDamage() {
    if (this.invincible || this.shrinking) return;
    if (this.isBig) {
      this.shrinking = true;
      this.isBig = false;
      this.anim.play("mario_shrink");
      this.getComponent(cc.Sprite).spriteFrame = this.smallMarioSprite;
      cc.audioEngine.playEffect(this.shrinkSound, false);
      this.scheduleOnce(() => {
        this.shrinking = false;
      }, 1.5);
    } else {
      this.die();
    }
  }

  update(dt) {
    if (this.isDead) return;

    let speed = 0;
    if (this.lDown) speed = -250;
    else if (this.rDown) speed = 250;

    this.node.x += speed * dt;

    // Clamp player within map bounds (map is 3200px wide, starting at x=-480 in canvas)
    const mapLeft = -464;
    const mapRight = -464 + 3200 - 16;
    if (this.node.x < mapLeft) this.node.x = mapLeft;
    if (this.node.x > mapRight) this.node.x = mapRight;

    if (this.spaceDown && this.onGround) {
      this.jump();
    }

    if (this.mainCamera) {
      // Camera follows player but clamps to map edges
      const camHalfW = 480;
      let camX = this.node.x;
      if (camX < mapLeft + camHalfW) camX = mapLeft + camHalfW;
      if (camX > mapRight - camHalfW) camX = mapRight - camHalfW;
      this.mainCamera.x = camX;
    }

    if (this.coinLabel) this.coinLabel.string = this.coins.toString();
    if (this.scoreLabel) this.scoreLabel.string = this.score.toString();
  }

  addScore(pts: number) {
    this.score += pts;
  }

  onBeginContact(contact, self, other) {
    let normal = contact.getWorldManifold().normal;

    // Landing on top of something
    if (normal.y === -1) {
      if (
        other.node.name === "ground" ||
        other.tag === 3 ||
        other.tag === 4 ||
        other.tag === 7
      ) {
        this.onGround = true;
        this.playIdleAnim();
      }
      // Stomp enemy
      else if (other.tag === 2) {
        cc.audioEngine.playEffect(this.stompSound, false);
        this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 400);
        this.onGround = false;
        this.addScore(100);
      }
      // Fall out of world
      else if (other.node.name === "Lower_bound" || other.tag === 9) {
        this.die();
      }
      // Coin from top
      else if (other.node.name === "coin" || other.tag === 8) {
        cc.audioEngine.playEffect(this.coinSound, false);
        this.coins++;
        this.addScore(50);
        other.node.destroy();
      }
      // Mushroom from top
      else if (other.tag === 5) {
        this.eatMushroom(other.node);
      }
    }

    // Hit from below (Q-block)
    else if (normal.y === 1) {
      if (other.tag === 4) {
        other.node.getComponent("Qblock") &&
          other.node.getComponent("Qblock").onHit(this.node);
      }
    }

    // Side collision
    else {
      if (other.tag === 3 || other.tag === 4) {
        this.onGround = true;
      } else if (other.tag === 2) {
        this.takeDamage();
      } else if (
        other.tag === 9 ||
        other.node.name === "Lower_bound" ||
        other.node.name === "left_bound" ||
        other.node.name === "right_bound"
      ) {
        this.die();
      } else if (other.node.name === "coin" || other.tag === 8) {
        cc.audioEngine.playEffect(this.coinSound, false);
        this.coins++;
        this.addScore(50);
        other.node.destroy();
      } else if (other.tag === 5) {
        this.eatMushroom(other.node);
      }
      // Reach flag/goal
      else if (other.tag === 6) {
        this.onWin(contact);
      }
    }
  }

  onEndContact(contact, self, other) {
    if (
      other.node.name === "ground" ||
      other.tag === 3 ||
      other.tag === 4 ||
      other.tag === 7
    ) {
      this.onGround = false;
    }
  }

  private eatMushroom(mushroomNode: cc.Node) {
    if (!this.isBig) {
      this.isBig = true;
      this.anim.play("mario_grow");
      this.getComponent(cc.Sprite).spriteFrame = this.bigMarioSprite;
      cc.audioEngine.playEffect(this.growSound, false);
      this.addScore(200);
    } else {
      this.addScore(50);
    }
    mushroomNode.destroy();
  }

  private onWin(contact) {
    contact.disabled = true;
    this.lDown = this.rDown = this.spaceDown = false;
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

    if (this.isBig) this.anim.play("Big_win");
    else this.anim.play("mario_win");

    let levelMgr =
      cc.find("Canvas") && cc.find("Canvas").getComponent("LevelManager");
    if (levelMgr) (levelMgr as any).win();
  }

  onDestroy() {
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
  }
}
