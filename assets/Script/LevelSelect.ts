const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelSelect extends cc.Component {

    onLevel1Btn() {
        cc.director.loadScene("Level1");
    }

    onLevel2Btn() {
        cc.director.loadScene("Level2");
    }

    onBackBtn() {
        cc.director.loadScene("MainMenu");
    }
}
