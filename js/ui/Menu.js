
export default class Menu {

    constructor(bodyName, p2p, game, clock, page) {
        this.bodyName = bodyName
        this.p2p = p2p
        this.game = game
        this.clock = clock
        this.page = page
    }

    playOffline(){
        this.page.setState("game")
        this.game.handShakeComplete = true;
        this.game.me.setHandAction("handPointing")
    }

    host(){
        const roomName = this.hostField.text
        this.p2p.host(roomName);
        this.game.setP2P(this.p2p)
        this.clock.setP2P(this.p2p)
        this.game.setPlayerColors(this.game.me, ["white"])
        this.game.setPlayerColors(this.game.you, ["black"])
        this.game.handShake = false;
        this.page.setState("game");
    }

    join(){
        const roomName = this.joinField.text
        this.p2p.join(roomName)
        this.game.setP2P(this.p2p)
        this.clock.setP2P(this.p2p)
        this.game.setPlayerColors(this.game.me, ["black"])
        this.game.setPlayerColors(this.game.you, ["white"])
        this.game.me.setPerspective(-1)
        this.game.boardOrientation *= -1;
        this.page.setState("game");
    }

    mainMenu(){
        this.page.setState("menu");
    }

    onMouseMove(mouse) {
        for (const widget of this.widgets)
            if (widget.onMouseMove)
                widget.onMouseMove(mouse);
    }

    onMouseDown(mouse) {
        for (const widget of this.widgets)
            widget.onMouseDown(mouse);
    }

    onKeyDown(e) {

        for (const widget of this.widgets)
            if (widget.onKeyDown)
                widget.onKeyDown(e);
    }
}