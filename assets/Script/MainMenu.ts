const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenu extends cc.Component {

    @property(cc.AudioClip) bgm: cc.AudioClip = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.bgm) cc.audioEngine.playMusic(this.bgm, true);
    }

    onStartBtn() {
        cc.director.loadScene("LevelSelect");
    }

    onLeaderboardBtn() {
        cc.director.loadScene("Leaderboard");
    }

    onExitBtn() {
        cc.game.end();
    }
}
