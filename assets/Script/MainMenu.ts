const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenu extends cc.Component {

    @property({ type: cc.AudioClip })
    bgm: cc.AudioClip = null;

    start() {
        if (this.bgm) cc.audioEngine.playMusic(this.bgm, true);
    }

    onStartBtn() {
        cc.director.loadScene("LevelSelect");
    }

    onExitBtn() {
        cc.game.end();
    }
}
