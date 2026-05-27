const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy_Goomba extends cc.Component {

  @property({ type: cc.AudioClip })
  stompSound: cc.AudioClip = null;

  private moveSpeed: number = 60;
  private isDead: boolean = false;
  private rb: cc.RigidBody = null;

  onLoad() {
    cc.director.getPhysicsManager().enabled = true;
    this.rb = this.getComponent(cc.RigidBody);
  }

  update(dt) {
    if (this.isDead) return;
    this.node.x -= this.moveSpeed * dt;
  }

  onBeginContact(contact, self, other) {
    if (this.isDead) return;

    const normal = contact.getWorldManifold().normal;

    // Player stomps goomba from above
    if (other.tag === 1 && normal.y === 1) {
      this.onStomp();
      return;
    }

    // Hit wall or pipe → reverse
    if (normal.x !== 0) {
      if (other.tag === 3 || other.tag === 4) {
        this.moveSpeed *= -1;
        this.node.scaleX *= -1;
      }
    }

    // Fell into lower bound → destroy
    if (other.tag === 9 || other.node.name === "Lower_bound") {
      this.node.destroy();
    }
  }

  private onStomp() {
    this.isDead = true;
    if (this.stompSound) cc.audioEngine.playEffect(this.stompSound, false);
    if (this.rb) this.rb.linearVelocity = cc.v2(0, 0);
    this.node.scaleY = 0.3;
    this.scheduleOnce(() => { this.node.destroy(); }, 0.4);
  }
}
