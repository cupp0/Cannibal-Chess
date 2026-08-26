import Button from "./Button.js";
import TextField from "./TextField.js";
export default class Menu {

    constructor(p2p, game, clock, page) {
        this.p2p = p2p
        this.game = game
        this.clock = clock
        this.page = page
    }

    initUI(){
        this.widgets = [

            new Button(
                "playoffline",
                50, 
                118,
                100,
                12,
            ),

            new Button(
                "host",
                38,
                135,
                37,
                12,
            ),

            new Button(
                "join",
                38, 
                149,
                36,
                12,
            ),
            new TextField(80, 136, 86, 11),
            new TextField(80, 150, 86, 11)
        ];

        this.widgets[0].setCallback(this.playOffline.bind(this))
        this.widgets[1].setCallback(this.host.bind(this))
        this.widgets[2].setCallback(this.join.bind(this))
  
        this.hostField = this.widgets[3]
        this.joinField = this.widgets[4]   
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