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
        if (GameData.inst) GameData.inst.reset();
        cc.director.loadScene("Level1");
    }

    onLevel2Btn() {
        if (GameData.inst) GameData.inst.reset();
        // Level2 ยังใช้ map เดียวกับ Level1 ไปก่อน
        cc.director.loadScene("Level1");
    }

    onBackBtn() {
        cc.director.loadScene("MainMenu");
    }
}
