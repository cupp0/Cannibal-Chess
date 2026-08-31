import {renderSprite} from '../render.js';

export default class CaptureAnimation {

    constructor(startTime, move, orientation) {
        this.startTime = startTime; 
        this.currentTime = startTime;
        this.finished = false;
        this.move = move;
        this.x = orientation === 1 ? move.to.x: 7-move.to.x;
        this.y = orientation === 1 ? move.to.y: 7-move.to.y;
        this.duration = 16;
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration) this.finished = true;
    }

    updateShake(){
        const amount = this.duration- (this.currentTime-this.startTime)
        this.xOff = Math.random()*amount/2-amount/4;
        this.yOff = Math.random()*amount/2-amount/4;
    }

    draw(ctx) {
        if ((this.currentTime - this.startTime)%2 === 0) this.updateShake();
        const x = this.x * 32 + this.xOff;
        const y = this.y * 32 + this.yOff;

        renderSprite(
            ctx,
            this.move.piece.color+"-"+this.move.piece.label.toLowerCase(),
            x,
            y
        );
    }
  
}