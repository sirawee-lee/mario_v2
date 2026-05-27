import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    @property({ type: cc.AudioClip })
    bgm: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    victorySound: cc.AudioClip = null;

    // UI Labels
    private scoreLabel: cc.Label = null;
    private livesLabel: cc.Label = null;
    private coinsLabel: cc.Label = null;
    private timeLabel: cc.Label = null;

    remainTime: number = 300;
    private isWin: boolean = false;
    private isGameover: boolean = false;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -600);
    }

    start() {
        // หา Labels ใน UI
        this.findLabels();

        // เล่น BGM
        if (this.bgm) cc.audioEngine.playMusic(this.bgm, true);

        // โหลด lives จาก GameData
        if (GameData.inst) {
            this.updateLivesUI(GameData.inst.lives);
            this.updateScoreUI(GameData.inst.score);
            this.updateCoinsUI(GameData.inst.coins);
        }
    }

    findLabels() {
        let scoreNode = cc.find("Canvas/Main Camera/UI/TopBar/Score/value");
        let livesNode = cc.find("Canvas/Main Camera/UI/TopBar/Lives/number");
        let coinsNode = cc.find("Canvas/Main Camera/UI/TopBar/Coins/number");
        let timeNode  = cc.find("Canvas/Main Camera/UI/TopBar/Time/value");

        if (scoreNode) this.scoreLabel = scoreNode.getComponent(cc.Label);
        if (livesNode) this.livesLabel = livesNode.getComponent(cc.Label);
        if (coinsNode) this.coinsLabel = coinsNode.getComponent(cc.Label);
        if (timeNode)  this.timeLabel  = timeNode.getComponent(cc.Label);
    }

    update(dt) {
        if (this.isWin || this.isGameover) return;

        this.remainTime -= dt;
        if (this.remainTime < 0) this.remainTime = 0;
        if (this.timeLabel) this.timeLabel.string = Math.ceil(this.remainTime).toString();

        if (this.remainTime <= 0) {
            this.isGameover = true;
            this.triggerGameover();
        }
    }

    updateScoreUI(score: number) {
        if (this.scoreLabel) this.scoreLabel.string = score.toString();
    }

    updateLivesUI(lives: number) {
        if (this.livesLabel) this.livesLabel.string = "x" + lives.toString();
    }

    updateCoinsUI(coins: number) {
        if (this.coinsLabel) this.coinsLabel.string = coins.toString();
    }

    triggerWin() {
        if (this.isWin) return;
        this.isWin = true;
        cc.audioEngine.stopMusic();
        if (this.victorySound) cc.audioEngine.playMusic(this.victorySound, false);
        this.scheduleOnce(() => {
            cc.director.loadScene("Gameover");
        }, 4);
    }

    triggerGameover() {
        cc.audioEngine.stopMusic();
        this.scheduleOnce(() => {
            cc.director.loadScene("Gameover");
        }, 2);
    }
}
