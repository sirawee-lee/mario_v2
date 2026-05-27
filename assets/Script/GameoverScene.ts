const { ccclass, property } = cc._decorator;

@ccclass
export default class GameoverScene extends cc.Component {

    @property({ type: cc.AudioClip })
    gameoverBgm: cc.AudioClip = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.gameoverBgm) cc.audioEngine.playMusic(this.gameoverBgm, false);
    }

    onRetryBtn() {
        cc.director.loadScene("Level1");
    }

    onMenuBtn() {
        cc.director.loadScene("MainMenu");
    }
}
