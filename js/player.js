import {toScreen} from './render.js'

export default class Player{

    constructor(x, y){
        this.frameCount = 0;
        this.refreshTime = 5;
        this.pos = {x: x, y: y}
        this.setTargetPos(x, y)
        this.setPerspective(1)
        this.active = false;
        this.handAction = "handClosed"
    }

    setColors(colors){
        this.colors = colors;
    }

    setHandAction(action){
        this.handAction = action
    }

    setPerspective(p){
        this.perspective = p;
    }

    setTargetPos(x, y){
        this.frameCount = 0;
        this.targetPos = {x: x, y: y}
        this.relPos = toScreen(this.targetPos, this.perspective)
        const xVel = (this.targetPos.x - this.pos.x) / this.refreshTime;
        const yVel = (this.targetPos.y - this.pos.y) / this.refreshTime;
        this.vel = {x: xVel, y: yVel}
    }

    update(){
        if (this.frameCount < this.refreshTime){
            this.pos = {x: this.pos.x+this.vel.x, y: this.pos.y+this.vel.y}
            this.frameCount++;
        }
    }

    updateLocal(mouse){
        this.pos = mouse.world
        this.relPos = toScreen(this.pos, this.perspective)
    }

}