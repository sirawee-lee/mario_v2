import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelClear extends cc.Component {

    @property(cc.Label) scoreLabel: cc.Label | null = null;
    @property(cc.Label) livesLabel: cc.Label | null = null;
    @property(cc.Label) coinsLabel: cc.Label | null = null;
    @property(cc.AudioClip) clearSound: cc.AudioClip | null = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.clearSound) cc.audioEngine.playMusic(this.clearSound, false);

        if (GameData.inst) {
            if (this.scoreLabel) this.scoreLabel.string = "Score:  " + GameData.inst.score;
            if (this.livesLabel) this.livesLabel.string = "Lives: x" + GameData.inst.lives;
            if (this.coinsLabel) this.coinsLabel.string = "Coins: " + GameData.inst.coins;
        }
    }

    onNextLevel() {
        if (!GameData.inst) return;
        if (GameData.inst.level >= 2) {
            cc.director.loadScene("ThanksForPlaying");
        } else {
            GameData.inst.level++;
            cc.director.loadScene(`Level${GameData.inst.level}`);
        }
    }

    onMainMenu() {
        if (GameData.inst) GameData.inst.reset();
        cc.director.loadScene("MainMenu");
    }
}
