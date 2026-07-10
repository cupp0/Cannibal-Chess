import {renderSprite, dissolve} from '../render.js';

export default class CannibalAnimation {

    constructor(startTime, move) {
        this.startTime = startTime; 
        this.move = move
        this.currentTime = startTime
        this.duration = 16;
        this.finished = false;
        this.cannibalLabel = this.setCannibalLabel(move)
        console.log(this.cannibalLabel)
    }

    setCannibalLabel(move){
        const l = move.piece.label+move.target.label;
        return this.move.piece.color+"-"+[...new Set(l)].sort().join('').toLowerCase();
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration)
            this.finished = true;
    }


    draw(ctx) {

        const x = this.move.to.x * 32;
        const y = this.move.to.y * 32;

        dissolve(
            ctx,
            this.move.piece.color+"-"+this.move.piece.label.toLowerCase(),
            this.cannibalLabel,
            x,
            y,
            (Math.floor((this.currentTime)/4)*4-this.startTime)/this.duration
        );
    }


}