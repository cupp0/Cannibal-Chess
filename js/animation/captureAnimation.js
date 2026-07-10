import {renderSprite} from '../render.js';

export default class CaptureAnimation {

    constructor(startTime, move) {
        this.startTime = startTime; 
        this.move = move
        this.currentTime = startTime
        this.duration = 16;
        this.finished = false;
    }


    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration)
            this.finished = true;
    }

    updateShake(){
        const amount = this.duration- (this.currentTime-this.startTime)
        this.xOff = Math.random()*amount/2-amount/4;
        this.yOff = Math.random()*amount/2-amount/4;
    }


    draw(ctx) {
        if ((this.currentTime - this.startTime)%4 === 0){
            this.updateShake();
        }
        const x = this.move.to.x * 32 + this.xOff;
        const y = this.move.to.y * 32 + this.yOff;

        renderSprite(
            ctx,
            this.move.piece.color+"-"+this.move.piece.label.toLowerCase(),
            x,
            y
        );
    }

    
}