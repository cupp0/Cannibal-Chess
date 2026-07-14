import {getBuffer, renderBuffer} from '../render.js';

export default class MoveAnimation {

    constructor(startTime, move, dragging, orientation) {
        this.startTime = startTime; 
        this.currentTime = startTime;
        this.duration = 4;
        this.move = move;
        this.orientation = orientation;
        this.from = orientation === 1 ? {x: move.from.x, y: move.from.y} : {x: 7-move.from.x, y: 7-move.from.y}
        this.to = orientation === 1 ? {x: move.to.x, y: move.to.y} : {x: 7-move.to.x, y: 7-move.to.y}
        this.buffer = getBuffer(move.piece.color+"-"+move.piece.label.toLowerCase());
        this.finished = false;
        if (dragging) this.finished = true;
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration) this.finished = true;
    }

    draw(ctx) {
        let t = (this.currentTime - this.startTime) / this.duration;
        const x = (this.from.x + (this.to.x - this.from.x) * t )* 32;
        const y = (this.from.y + (this.to.y - this.from.y) * t )* 32;
        renderBuffer( ctx, this.buffer, x, y);
    }
}