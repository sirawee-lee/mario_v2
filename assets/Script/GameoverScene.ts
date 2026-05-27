import GameData from "./GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameoverScene extends cc.Component {

    @property({ type: cc.AudioClip })
    gameoverBgm: cc.AudioClip = null;

    @property(cc.Label) finalScoreLabel: cc.Label = null;
    @property(cc.Label) playerNameLabel: cc.Label = null;
    @property(cc.Node)  scoreListNode: cc.Node = null;

    start() {
        cc.audioEngine.stopMusic();
        if (this.gameoverBgm) cc.audioEngine.playMusic(this.gameoverBgm, false);

        let data = GameData.inst;
        if (data) {
            if (this.finalScoreLabel) this.finalScoreLabel.string = "SCORE: " + data.score;
            if (this.playerNameLabel) this.playerNameLabel.string = data.playerName;

            if (data.isLoggedIn) {
                this.saveScore(data.playerName, data.score);
            }
            this.loadLeaderboard();
        }
    }

    saveScore(name: string, score: number) {
        try {
            let ref = firebase.database().ref("leaderboard/" + name);
            ref.once("value", (snap) => {
                let prev = snap.val() ? snap.val().score : 0;
                if (score > prev) {
                    ref.set({ name: name, score: score, time: Date.now() });
                }
            });
        } catch (e) { cc.log("Firebase not ready"); }
    }

    loadLeaderboard() {
        try {
            firebase.database().ref("leaderboard")
                .orderByChild("score").limitToLast(5)
                .once("value", (snap) => {
                    let entries = [];
                    snap.forEach((c) => { entries.push(c.val()); return false; });
                    entries.reverse();
                    this.renderBoard(entries);
                });
        } catch (e) {
            this.renderBoard([]);
        }
    }

    renderBoard(entries: any[]) {
        if (!this.scoreListNode) return;
        this.scoreListNode.removeAllChildren();

        if (entries.length === 0) {
            let n = new cc.Node();
            let l = n.addComponent(cc.Label);
            l.string = "No scores yet!";
            l.fontSize = 26;
            this.scoreListNode.addChild(n);
            return;
        }

        entries.forEach((e, i) => {
            let n = new cc.Node();
            let l = n.addComponent(cc.Label);
            l.string = `${i + 1}.  ${e.name}  —  ${e.score}`;
            l.fontSize = 26;
            l.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            n.color = i === 0 ? new cc.Color(255, 215, 0) : cc.Color.WHITE;
            n.setPosition(0, -i * 40);
            this.scoreListNode.addChild(n);
        });
    }

    onRetryBtn() {
        if (GameData.inst) GameData.inst.reset();
        cc.director.loadScene("Level1");
    }

    onMenuBtn() {
        if (GameData.inst) GameData.inst.reset();
        cc.director.loadScene("MainMenu");
    }
}
