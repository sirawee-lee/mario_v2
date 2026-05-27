const { ccclass, property } = cc._decorator;

@ccclass
export default class VictoryScene extends cc.Component {

    @property({ type: cc.AudioClip })
    victorySfx: cc.AudioClip = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.victorySfx) cc.audioEngine.playMusic(this.victorySfx, false);
    }

    onNextBtn() {
        cc.director.loadScene("Level2");
    }

    onMenuBtn() {
        cc.director.loadScene("MainMenu");
    }
}
