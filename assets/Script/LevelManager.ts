const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelManager extends cc.Component {

    @property({ type: cc.AudioClip })
    bgm: cc.AudioClip = null;

    @property({ type: cc.AudioClip })
    victorySound: cc.AudioClip = null;

    @property(cc.Node)
    canvas: cc.Node = null;

    @property(cc.Node)
    mainCamera: cc.Node = null;

    @property(cc.Prefab)
    pauseBoard: cc.Prefab = null;

    @property(cc.String)
    nextScene: string = "Gameover";

    remainTime: number = 300;
    gameLevel: number = 1;

    private win: boolean = false;
    private gameover: boolean = false;
    private pauseCount: number = 0;

    private timeLabel: cc.Label = null;
    private levelLabel: cc.Label = null;

    onLoad() {
        let timeNode = cc.find("Canvas/Main Camera/UI/TopBar/Time/value");
        let levelNode = cc.find("Canvas/Main Camera/UI/TopBar/Level/value");
        if (timeNode) this.timeLabel = timeNode.getComponent(cc.Label);
        if (levelNode) this.levelLabel = levelNode.getComponent(cc.Label);
    }

    start() {
        cc.audioEngine.playMusic(this.bgm, true);
        this.initPauseButton();
    }

    initPauseButton() {
        let pauseBtn = cc.find("Canvas/Main Camera/UI/PauseBtn");
        if (!pauseBtn) return;
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "LevelManager";
        handler.handler = "onPause";
        pauseBtn.getComponent(cc.Button).clickEvents.push(handler);
    }

    onPause() {
        this.pauseCount++;
        if (this.pauseCount !== 1) return;

        let board = cc.instantiate(this.pauseBoard);
        this.canvas.addChild(board);
        board.setPosition(this.mainCamera.x, 0);
        cc.audioEngine.pauseMusic();
        cc.director.pause();

        let continueBtn = cc.find("Canvas/pauseBoard/Continue");
        let quitBtn = cc.find("Canvas/pauseBoard/Quit");
        if (continueBtn) {
            let h = new cc.Component.EventHandler();
            h.target = this.node;
            h.component = "LevelManager";
            h.handler = "onResume";
            continueBtn.getComponent(cc.Button).clickEvents.push(h);
        }
        if (quitBtn) {
            let h = new cc.Component.EventHandler();
            h.target = this.node;
            h.component = "LevelManager";
            h.handler = "onQuit";
            quitBtn.getComponent(cc.Button).clickEvents.push(h);
        }
    }

    onResume() {
        this.pauseCount = 0;
        let board = cc.find("Canvas/pauseBoard");
        if (board) board.destroy();
        cc.director.resume();
        cc.audioEngine.resumeMusic();
    }

    onQuit() {
        this.pauseCount = 0;
        let board = cc.find("Canvas/pauseBoard");
        if (board) board.destroy();
        cc.director.resume();
        cc.director.loadScene("MainMenu");
    }

    winGame() {
        if (this.win) return;
        this.win = true;
        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(this.victorySound, false);

        this.scheduleOnce(() => {
            cc.director.loadScene(this.nextScene);
        }, 4);
    }

    update(dt) {
        if (this.win || this.gameover) return;

        this.remainTime -= dt;
        if (this.remainTime < 0) this.remainTime = 0;

        if (this.timeLabel) this.timeLabel.string = Math.ceil(this.remainTime).toString();
        if (this.levelLabel) this.levelLabel.string = this.gameLevel.toString();

        if (this.remainTime <= 0) {
            this.gameover = true;
            cc.director.loadScene("Gameover");
        }
    }
}
