import Switch from "./Switch.js";
import Slider from "./Slider.js";
import Action from '../net/action.js';

export default class Clock{
    constructor(){
        //relative to top left of board
        this.pos = {x:260, y:83}
        this.currentTime = 0;
        this.whiteTime = 0;
        this.blackTime = 0;
        this.activeColor = "none";
        this.p2p = null;
    }

    initUI(){
        this.widgets = [
        
        new Switch(
            "clockButtonUp",
            "white",
            this.pos.x + 42, 
            this.pos.y + 13,
            9,
            17
        ),

        new Switch(
            "clockButtonUp",
            "black",
            this.pos.x + 42, 
            this.pos.y + 60,
            9,
            17
        ),

        new Slider(
            "clockTimerKnob",
            this.pos.x + 4, 
            this.pos.y + 40,
            4,
            10
        ),
        ]

        this.widgets[0].setCallback(this.onTimePressed.bind(this));
        this.widgets[1].setCallback(this.onTimePressed.bind(this));
        this.widgets[2].setCallback(this.setTimeControl.bind(this));

        this.slider = this.widgets[2]
    }

    setP2P(p2p){
        this.p2p = p2p;
    }

    update(now){
        const delta = now - this.currentTime;
        switch (this.activeColor){
            case "none" : break;
            case "white" : this.whiteTime -= delta; break;
            case "black" : this.blackTime -= delta; break;
        }
        this.currentTime = now;
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

    onMouseUp(mouse) {
        for (const widget of this.widgets)
            widget.onMouseUp(mouse);
    }

    onTimePressed(color){
        this.activeColor = color;
        if (!this.p2p) return;
        this.p2p.send(new Action("clockButtonPress", 
            {w: this.whiteTime, b: this.blackTime, a: this.activeColor}
        ))
    }

    receiveClockSet(clockState){
        this.timeControl = clockState.t
        this.whiteTime = clockState.w;
        this.blackTime = clockState.b;
        this.activeColor = clockState.a;
        for (const widget of this.widgets){
            if (widget.name === "clockTimerKnob"){
                widget.x = this.map(this.timeControl, 60000, 600000, 268, 310)
            }
        }
    }

    receiveClockButtonPress(clockState){
        this.whiteTime = clockState.w;
        this.blackTime = clockState.b;
        this.activeColor = clockState.a;
    }

    setTimeControl(mouse){
        this.slider.x = Math.min(Math.max(mouse.world.x-3, 268), 310);
        this.timeControl = this.map(this.slider.x, 268, 310, 60000, 600000)
        this.blackTime = this.timeControl
        this.whiteTime = this.timeControl
        this.activeColor = "none";
        if (!this.p2p) return;
        this.p2p.send(new Action("clockSet", 
            {t: this.timeControl, w: this.whiteTime, b: this.blackTime, a: this.activeColor}))
    }

    map(value, inMin, inMax, outMin, outMax){
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
}