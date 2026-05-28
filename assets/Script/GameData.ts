const { ccclass } = cc._decorator;

@ccclass
export default class GameData extends cc.Component {

    private static _inst: GameData = null;
    static get inst() { return GameData._inst; }

    score: number = 0;
    lives: number = 3;
    coins: number = 0;
    level: number = 1;
    playerName: string = "Player";
    idToken: string = "";
    isLoggedIn: boolean = false;

    onLoad() {
        if (GameData._inst) { this.node.destroy(); return; }
        GameData._inst = this;
        cc.game.addPersistRootNode(this.node);
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        this.level = 1;
    }

    logout() {
        this.isLoggedIn = false;
        this.playerName = "Player";
        this.idToken = "";
    }
}
