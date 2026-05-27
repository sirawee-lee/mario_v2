const { ccclass } = cc._decorator;

// Singleton เก็บ score/lives ข้าม scene
@ccclass
export default class GameData extends cc.Component {

    private static _inst: GameData = null;
    static get inst() { return GameData._inst; }

    score: number = 0;
    lives: number = 3;
    coins: number = 0;
    playerName: string = "Player";
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
    }
}
