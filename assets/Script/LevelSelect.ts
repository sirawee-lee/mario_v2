import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelSelect extends cc.Component {

    @property({ type: cc.AudioClip })
    bgm: cc.AudioClip = null;

    start() {
        if (this.bgm) cc.audioEngine.playMusic(this.bgm, true);
    }

    onLevel1Btn() {
        if (GameData.inst) {
            GameData.inst.reset();
            GameData.inst.level = 1;
        }
        cc.director.loadScene("GameIntro");
    }

    onLevel2Btn() {
        if (GameData.inst) {
            GameData.inst.reset();
            GameData.inst.level = 2;
        }
        cc.director.loadScene("GameIntro");
    }

    onBackBtn() {
        cc.director.loadScene("MainMenu");
    }
}
