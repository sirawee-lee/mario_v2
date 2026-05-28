import GameData from "./GameData";
import FirebaseService from "./FirebaseService";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameoverScene extends cc.Component {

    @property(cc.AudioClip) gameoverBgm: cc.AudioClip = null;
    @property(cc.Label) finalScoreLabel: cc.Label = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.gameoverBgm) cc.audioEngine.playMusic(this.gameoverBgm, false);

        if (GameData.inst) {
            const name  = GameData.inst.playerName || "Player";
            const score = GameData.inst.score;
            if (this.finalScoreLabel) this.finalScoreLabel.string = "SCORE: " + score;
            FirebaseService.submitScore(name, score);
        }
    }

    onLeaderboardBtn() {
        cc.director.loadScene("Leaderboard");
    }

    onMenuBtn() {
        if (GameData.inst) GameData.inst.reset();
        cc.director.loadScene("MainMenu");
    }
}
