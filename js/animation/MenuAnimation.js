import {getBuffer, renderBuffer} from '../render.js';

export default class MenuAnimation {

    constructor(menu, startTime, callback) {
        this.menu = menu;
        this.startTime = startTime;
        this.callback = callback;
        this.duration = 80;
        this.titleSplash = getBuffer("titlesplash");
        this.mask = this.createEmptyBuffer(this.titleSplash);
        this.transMask = this.createEmptyBuffer(this.titleSplash);
        this.mask[55][180] = 1 //seed
    }

    dilateMasks(){
        const percentDone = (this.currentTime - this.startTime) / this.duration;
        this.temp = this.createEmptyBuffer(this.mask)

        this.forEachPixel(this.mask, (x, y) => {
            if (this.pixelIsExterior({x:x, y:y}, this.mask)){
                const neighbors = this.getNeighbors({x: x, y: y}, this.mask)
                for (const n of neighbors){
                    if (Math.random() > percentDone) continue;
                    if (this.titleSplash[n.y][n.x][0] < 5)this.temp[n.y][n.x] = 1;
                    if (Math.random()* this.titleSplash[n.y][n.x][0] < 80) continue;
                    if (this.titleSplash[n.y][n.x][2] > this.titleSplash[n.y][n.x][0] && Math.random() < .85) continue;
                    this.temp[n.y][n.x] = 1;
                }
            }
        })

        this.forEachPixel(this.transMask, (x, y) => {
            if (this.transMask[y][x] > 0) {
                this.transMask[y][x] -= .01;
            }
            if (this.temp[y][x] === 1){
                this.mask[y][x] = 1;
                this.transMask[y][x] = 1;
            }
        })

    }

    translate(buffer, amount, mult){
        const newb = [];
        for (let y = 0; y < buffer.length; y++) {
            newb[y] = []
            for (let x = 0; x < buffer[y].length; x++) {
                newb[y][x] = []
                const potentialCoords = {x: x+(Math.round(amount[y][x]*mult)), y: y+(Math.round(amount[y][x]*mult))}
                const inBounds = this.inBounds(potentialCoords, buffer);
                const trans = inBounds ? potentialCoords : {x:x, y:y}

                for (let z = 0; z < buffer[y][x].length; z++){
                    newb[y][x][z] = buffer[trans.y][trans.x][z]
                }
            }
        }
        return newb;
    }

    addColor(buffer, amount, mult){
        const newb = [];
        for (let y = 0; y < buffer.length; y++) {
            newb[y] = []
            for (let x = 0; x < buffer[y].length; x++) {
                newb[y][x] = []
                for (let z = 0; z < buffer[y][x].length; z++){
                    newb[y][x][z] = buffer[y][x][z]+ ((Math.random()-.5) * amount[y][x] * mult)
                }
            }
        }
        return newb;
    }

    getNeighbors(coord, buffer){
        const coords = [];
        for (let i = -1; i <= 1; i++){
            for (let j = -1; j <= 1; j++){
                if (i === 0 && j === 0) continue;
                const neighbor = {x: coord.x+i, y: coord.y+j};
                if (!this.inBounds(neighbor, buffer)) continue;
                coords.push(neighbor)
            }
        }
        return coords;
    }

    inBounds(coord, buffer){
        if(!(coord.y in buffer)) return false;
        if (!(coord.x in buffer[coord.y])) return false;
        return true;
    }

    createEmptyBuffer(buffer){
        const mask = [];
        for (let y = 0; y < buffer.length; y++) {
            mask[y] = []
            for (let x = 0; x < buffer[y].length; x++) {
                mask[y][x] = 0;
            }
        }
        return mask;
    }

    forEachPixel(buffer, callback) {
        for (let y = 0; y < buffer.length; y++) {
            for (let x = 0; x < buffer[y].length; x++) {
                callback(x, y);
            }
        }
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration) {
            this.finished = true;
        }
    }

    draw(ctx){
        for (let i = 0; i < 5; i++)this.dilateMasks();
        const t = this.translate(this.titleSplash, this.transMask, 25)
        const c = this.maskBuffer(t, this.mask);
        renderBuffer(ctx, c, 21, 88);
        if (this.currentTime - this.startTime + 1 === this.duration) this.finalFrame = c
    }
 
    maskBuffer(b, m){
        const newb = [];
        for (let y = 0; y < b.length; y++) {
            newb[y] = []
            for (let x = 0; x < b[y].length; x++) {
                newb[y][x] = []
                for (let z = 0;  z < b[y][x].length; z++){
                    newb[y][x][z] = b[y][x][z] * m[y][x];
                }
            }
        }
        return newb
    }

    maskToImageBuffer(mask){
        const newb = [];
        for (let y = 0; y < mask.length; y++) {
            newb[y] = []
            for (let x = 0; x < mask[y].length; x++) {
                newb[y][x] = []
                for (let i = 0; i < 4; i++) newb[y][x].push(mask[y][x] * 255)
            }
        }
        return newb
    }

    pixelIsExterior(coord, buff){
        if (buff[coord.y][coord.x] === 0)return false;
        const neighbors = this.getNeighbors(coord, buff);
        for (const n of neighbors){
            if (buff[n.y][n.x] === 0) return true;
        }
        return false;
    }
}