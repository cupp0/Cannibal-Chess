import {toScreen} from './render.js'

export default class Player{

    constructor(){
        this.frameCount = 0;
        this.refreshTime = 5;
        this.pos = {x: 0, y: 0}
        this.setTargetPos(0, 0)
        this.setPerspective(1)
        this.active = false;
        this.boardOrientation = 1;
        this.handAction = "handClosed"
    }

    switchPerspective(){
        this.perspective *= -1;
        //this.boardOrientation *= -1;
    }

    setColors(colors){
        this.colors = colors;
    }

    switchColors(){
        this.colors = this.colors.includes("white") ? ["black"] : ["white"]
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
        this.updateBoardCoords()
    }

    updateBoardCoords(){

        //so hand hitbox is a bit closer to where it displays
        const yOff = this.perspective === 1 ? 10 : -10
        const adjustedWorld = {x: Math.floor((this.pos.x) / 32), 
                               y: Math.floor((this.pos.y + yOff) / 32)};
                      
        this.board = this.perspective === 1 ? adjustedWorld : {x: 7 - adjustedWorld.x, y: 7 - adjustedWorld.y}
    }

}