import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameIntro extends cc.Component {

    @property(cc.Label) levelLabel: cc.Label = null;
    @property(cc.Label) livesLabel: cc.Label = null;

    start() {
        const level = GameData.inst ? GameData.inst.level : 1;
        const lives = GameData.inst ? GameData.inst.lives : 3;
        if (this.levelLabel) this.levelLabel.string = "LEVEL: " + level;
        if (this.livesLabel) this.livesLabel.string = "LIVES: x" + lives;
    }

    onStartBtn() {
        const level = GameData.inst ? GameData.inst.level : 1;
        cc.director.loadScene("Level" + level);
    }
}
