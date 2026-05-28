import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenu extends cc.Component {

    @property(cc.AudioClip) bgm: cc.AudioClip = null;
    @property(cc.EditBox)   nameInput: cc.EditBox = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.bgm) cc.audioEngine.playMusic(this.bgm, true);

        if (this.nameInput && GameData.inst)
            this.nameInput.string = GameData.inst.playerName || "Player";
    }

    onNameChanged(editbox: cc.EditBox) {
        if (!GameData.inst) return;
        GameData.inst.playerName = editbox.string.trim() || "Player";
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
