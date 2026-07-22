export default class Player{

    constructor(x, y){
        this.frameCount = 0;
        this.refreshTime = 5;
        this.pos = {x: x, y: y}
        this.setTargetPos(x, y)
        this.active = false;
    }

    setColors(colors){
        this.colors = colors;
    }

    setTargetPos(x, y){
        this.frameCount = 0;
        this.targetPos = {x: x, y: y}
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
        this.pos = {x: mouse.world.x, y: mouse.world.y}
    }

    getAbsolutePosition(){
        return this.colors.includes("white") ?
            this.pos : 
            {x:256 - this.pos.x, y:256 - this.pos.y}
    }
}