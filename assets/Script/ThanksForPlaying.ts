import GameData from "./GameData";
import FirebaseService from "./FirebaseService";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThanksForPlaying extends cc.Component {

    @property(cc.AudioClip) bgm: cc.AudioClip = null;
    @property(cc.Label) scoreLabel: cc.Label = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.bgm) cc.audioEngine.playMusic(this.bgm, true);

        if (GameData.inst) {
            if (this.scoreLabel)
                this.scoreLabel.string = "Score: " + GameData.inst.score;

            FirebaseService.submitScore(
                GameData.inst.playerName || "Player",
                GameData.inst.score
            ).catch(() => {});
        }
    }

    onLeaderboardBtn() {
        cc.director.loadScene("Leaderboard");
    }

    onMainMenuBtn() {
        if (GameData.inst) GameData.inst.reset();
        cc.director.loadScene("MainMenu");
    }
}
