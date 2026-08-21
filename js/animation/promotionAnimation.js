import {getBuffer, renderBuffer} from '../render.js';

export default class PromotionAnimation {

    constructor(startTime, move, orientation) {
        this.startTime = startTime; 
        this.currentTime = startTime;
        this.duration = 12;
        this.move = move;
        this.x = orientation === 1 ? move.to.x: 7-move.to.x;
        this.y = orientation === 1 ? move.to.y: 7-move.to.y;
        this.setBuffers()
    }

    setBuffers(){
        const color = this.move.piece.color;
        let piece = this.move.piece.label.toLowerCase();

        const beforeLabel = piece.split('').sort().join('');
        this.before = getBuffer(color+"-"+beforeLabel);

        if (!piece.includes("q")) piece += "q"
        const afterLabel = piece.split('').sort().join('').replace("p", '');
        console.log(afterLabel)
        this.after = getBuffer(color+"-"+afterLabel);

        this.empty = this.createEmptyBuffer(this.before)
    }

    createEmptyBuffer(b){
        const newb = []
        for (let y = 0; y < b.length; y++) {
            newb[y] = []
            for (let x = 0; x < b[y].length; x++) {
                newb[y][x] = [];
                for (let z = 0; z < 4; z++){
                    newb[y][x][z] = 0;
                }
            }
        }
        return newb;
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration) this.finished = true;
    }

    draw(ctx) {
        let buff = this.empty;
        const t = this.currentTime%4;
        if (t === 0) buff = this.before;
        if (t === 2) buff = this.after;
        renderBuffer( ctx, buff, this.x*32, this.y*32);
    }

}