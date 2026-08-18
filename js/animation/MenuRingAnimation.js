import {getBuffer, renderBuffer} from '../render.js';

export default class MenuAnimation {

    constructor(buffer, startTime) {
        this.buffer = buffer;
        this.titleSplash = getBuffer("titleSplash")
        this.mask = this.generateMask(this.buffer);
        this.seedColors();
        this.startTime = startTime;
        this.duration = 75;
    }

    seedColors(){
        this.colors = []
        for (let i = 0; i < 3; i++)this.colors.push(Math.random() * 255);
    }

    generateMask(b){
        const newb = [];
        for (let y = 0; y < b.length; y++) {
            newb[y] = []
            for (let x = 0; x < b[y].length; x++) {
                newb[y][x] = b[y][x][0] === 0 ? 1 : 0;
            }
        }
        return newb;
    }

    thing(buffer){       
        const percentDone = (this.currentTime - this.startTime) / this.duration;

        const newb = [];
        for (let y = 0; y < buffer.length; y++) {
            newb[y] = []
            for (let x = 0; x < buffer[y].length; x++) {
                newb[y][x] = []
                const val = buffer[y][x] === 1 ? 1 : 0;
                for (let z = 0; z < 3; z++){
                    if (val === 1){
                        newb[y][x][z] = val*this.colors[z] + (Math.random()*40 * z);
                    } else {
                        newb[y][x][z] =  0;
                    }
                }
                newb[y][x][3] = val === 255 ? val : (1 - percentDone)
            }
        }
        return newb;
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration) {
            this.finished = true;
        }
    }

    draw(ctx){
        renderBuffer(ctx, this.thing(this.mask), 21, 88);
    }

}