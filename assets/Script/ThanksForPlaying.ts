import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThanksForPlaying extends cc.Component {

    @property(cc.Label) scoreLabel: cc.Label = null;
    @property(cc.Label) livesLabel: cc.Label = null;
    @property(cc.Label) coinsLabel: cc.Label = null;
    @property(cc.AudioClip) bgm: cc.AudioClip = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.bgm) cc.audioEngine.playMusic(this.bgm, true);

        if (GameData.inst) {
            if (this.scoreLabel) this.scoreLabel.string = "Score: " + GameData.inst.score;
            if (this.livesLabel) this.livesLabel.string = "Lives: x" + GameData.inst.lives;
            if (this.coinsLabel) this.coinsLabel.string = "Coins: " + GameData.inst.coins;
        }
    }

    onLeaderboardBtn() {
        // เชื่อม Firebase ทีหลัง
    }

    onMainMenuBtn() {
        if (GameData.inst) GameData.inst.reset();
        cc.director.loadScene("MainMenu");
    }
}
