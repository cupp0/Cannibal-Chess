import {getBuffer, dissolve, renderBuffer} from '../render.js';

export default class CannibalAnimation {

    constructor(startTime, move) {
        this.startTime = startTime; 
        this.move = move
        this.currentTime = startTime
        this.finished = false;
        this.changingPixels = []
        this.morphBuffer = this.getOverlap(
           getBuffer(move.piece.getAssetString()), 
           getBuffer(move.target.getAssetString()));
        this.cannibalBuffer = getBuffer(this.getCannibalLabel(move));
        this.establishMorphBounds();
    }

    forEachPixel(buffer, callback) {
        for (let y = 0; y < buffer.length; y++) {
            for (let x = 0; x < buffer[y].length; x++) {
                callback(x, y);
            }
        }
    }

    //returns key for the resulting cannibal asset
    getCannibalLabel(move){
        const l = move.piece.label+move.target.label;
        return this.move.piece.color+"-"+[...new Set(l)].sort().join('').toLowerCase();
    }

    //creates a buffer taking the brightest pixel from each color channel
    getOverlap(p1, p2){
        const buffer = []
        for (let y = 0; y < p1.length; y++) {
            buffer[y] = []
            for (let x = 0; x < p1[y].length; x++) {
            const r = Math.max(p1[y][x][0], p2[y][x][0]);
            const g = Math.max(p1[y][x][1], p2[y][x][1]);
            const b = Math.max(p1[y][x][2], p2[y][x][2]);
            const a = Math.max(p1[y][x][3], p2[y][x][3]);
            buffer[y][x] = [r,g,b,a]
            }
        } 
        return buffer;
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration)
            this.finished = true;
    }

    establishMorphBounds(){
        this.pixelsToAdd = [];
        this.pixelsToRemove = [];
        for (let y = 0; y < this.morphBuffer.length; y++) {
            this.pixelsToAdd[y] = []
            this.pixelsToRemove[y] = []
            for (let x = 0; x < this.morphBuffer[y].length; x++) {
                if(this.morphBuffer[y][x][3] === 0 && this.cannibalBuffer[y][x][3] > 0){
                    this.pixelsToAdd[y][x] = true;
                } else this.pixelsToAdd[y][x] = false;
                if(this.morphBuffer[y][x][3] > 0 && this.cannibalBuffer[y][x][3] === 0){
                    this.pixelsToRemove[y][x] = true;
                } else this.pixelsToRemove[y][x] = false;
            }
        } 
    }

    updateMorph(){

        //make list of pixels on dilation/erosion border
        this.changingPixels = []
        let change = false;

        this.forEachPixel(this.morphBuffer, (x, y) =>{
            if ((this.pixelsToAdd[y][x] || this.pixelsToRemove[y][x]) && this.isNearBorder(this.morphBuffer, x, y)){
                const type = this.pixelsToAdd[y][x] ? "add" : "remove";
                this.changingPixels.push({x, y, type})
                this.pixelsToAdd[y][x] = false;
                this.pixelsToRemove[y][x] = false;
                change = true;
            }
        })

        if (!change){
            this.finished = true;
        }

        //dilate / erode
        for (const pixel of this.changingPixels){
            switch(pixel.type){
                case "add":
                    this.morphBuffer[pixel.y][pixel.x] = this.cannibalBuffer[pixel.y][pixel.x]
                    break;

                case "remove":
                    this.morphBuffer[pixel.y][pixel.x] = [0,0,0,0]
                    break;

                case "interior":
                    this.morphBuffer[pixel.y][pixel.x] = this.cannibalBuffer[pixel.y][pixel.x]
            }
        }

        //ensure outline is black
        this.forEachPixel(this.morphBuffer, (x, y) =>{
            if (this.isOnEdge(this.morphBuffer, x, y)){
                this.morphBuffer[y][x] = [0,0,0,255]
            }
        })

        //randomize interior pixels changing to cannibal
        this.forEachPixel(this.morphBuffer, (x, y) =>{
            if (this.morphBuffer[y][x][3] > 0 && !this.isOnEdge(this.morphBuffer, x, y)){
                if (Math.random() > .35){
                    this.morphBuffer[y][x] = this.cannibalBuffer[y][x]
                }
            }
        })

    }

    //returns true if a 3x3 kernel centered on x,y has both active and inactive pixels
    isNearBorder(buffer, x, y){
        const thisPixel = buffer[y][x][3] > 0;

        for (let i = -1; i <=1; i++){
            for (let j = -1; j <=1; j++){
                if (buffer[this.clamp(y+j, 0, 31)][this.clamp(x+i, 0, 31)][3] > 0 != thisPixel){
                    if (!thisPixel){
                        this.changingPixels.push({x: this.clamp(x+i, 0, 31), y: this.clamp(y+j, 0, 31), type: "interior"})
                    }
                    return true;
                }
            }
        }

        return false;
    }

    //returns true if a 3x3 kernel centered on x,y has both active and inactive pixels
    isOnEdge(buffer, x, y){

        let count = 0;
        if (buffer[y][x][3] === 0) return false;

        for (let i = -1; i <=1; i++){
            for (let j = -1; j <=1; j++){
                if (buffer[this.clamp(y+j, 0, 31)][this.clamp(x+i, 0, 31)][3] === 0){
                    count++;
                }
            }
        }

        return count > 1;
    }

    clamp(val, min, max){
        return Math.min(Math.max(val, min), max)
    }

    draw(ctx) {
        const x = this.move.to.x * 32;
        const y = this.move.to.y * 32;
        const amount = (this.currentTime - this.startTime) / this.duration;

        if ((this.currentTime - this.startTime)%3 === 2)this.updateMorph();
        //dissolve(ctx, this.morph, this.cannibal, x, y, amount)
        renderBuffer(ctx, this.morphBuffer, x, y)
    }


}