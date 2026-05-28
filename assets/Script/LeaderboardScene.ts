import GameData from "./GameData";
import FirebaseService from "./FirebaseService";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LeaderboardScene extends cc.Component {

    @property(cc.Label) leaderboardLabel: cc.Label = null;   // left: medal + name
    @property(cc.Label) scoreColumnLabel: cc.Label = null;   // right: score
    @property(cc.Label) playerRankLabel: cc.Label = null;    // rank when not top6
    @property(cc.Node)  leaderboardBg: cc.Node = null;       // white bg panel

    private blinkInterval: number = 0;

    start() {
        if (this.leaderboardBg)    this.leaderboardBg.opacity = 153;
        if (this.leaderboardLabel) this.leaderboardLabel.string = "Loading...";
        if (this.scoreColumnLabel) this.scoreColumnLabel.string = "";
        if (this.playerRankLabel)  this.playerRankLabel.node.active = false;

        FirebaseService.getLeaderboard()
            .then(entries => this.render(entries))
            .catch(() => {
                if (this.leaderboardLabel) this.leaderboardLabel.string = "Failed to load.";
            });
    }

    private render(entries: { name: string; score: number }[]) {
        const playerName  = GameData.inst ? (GameData.inst.playerName || "Player") : "";
        const playerScore = GameData.inst ? GameData.inst.score : -1;

        const top6 = entries.slice(0, 6);
        const playerRank = playerScore > 0
            ? entries.findIndex(e => e.name === playerName && e.score === playerScore)
            : -1;
        const inTop6 = playerRank >= 0 && playerRank < 6;

        let leftText  = "";
        let rightText = "";
        top6.forEach((e, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            const isPlayer = e.name === playerName && e.score === playerScore;
            leftText  += `${medal}  ${e.name}\n`;
            rightText += `${e.score}${isPlayer ? "  ★" : ""}\n`;
        });

        if (this.leaderboardLabel) this.leaderboardLabel.string = leftText;
        if (this.scoreColumnLabel) this.scoreColumnLabel.string = rightText;

        if (!inTop6 && playerRank >= 0 && this.playerRankLabel) {
            this.playerRankLabel.node.active = true;
            this.playerRankLabel.node.color = new cc.Color(255, 80, 80);
            this.playerRankLabel.string =
                `─────────────────\nYour rank: #${playerRank + 1}` +
                `\n${playerName}  ${playerScore}`;
            this.startBlink();
        }
    }

    private startBlink() {
        let visible = true;
        this.blinkInterval = setInterval(() => {
            if (!this.playerRankLabel) return;
            visible = !visible;
            this.playerRankLabel.node.color = visible
                ? new cc.Color(255, 80, 80)
                : new cc.Color(255, 255, 255);
        }, 500) as any;
    }

    onDestroy() {
        if (this.blinkInterval) clearInterval(this.blinkInterval);
    }

    onBackBtn() {
        if (this.blinkInterval) clearInterval(this.blinkInterval);
        cc.director.loadScene("MainMenu");
    }
}
