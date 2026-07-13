import {renderSprite} from '../render.js';

export default class MoveAnimation {

    constructor(startTime, move, dragging) {
        this.startTime = startTime; 
        this.move = move

        this.currentTime = startTime
        this.duration = 4;

        this.finished = false;
        if (dragging) this.finished = true;
    }


    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration)
            this.finished = true;
    }


    draw(ctx) {

        let t = (this.currentTime - this.startTime) / this.duration;

        const x =
            (this.move.from.x +
            (this.move.to.x - this.move.from.x) * t )* 32;

        const y =
            (this.move.from.y +
            (this.move.to.y - this.move.from.y) * t )* 32;

        renderSprite(
            ctx,
            this.move.piece.color+"-"+this.move.piece.label.toLowerCase(),
            x,
            y
        );
    }
}