const TILE = 32;

class Mouse{
    constructor(display){
        this.display = display;
        this.world = {x: 0, y: 0}
        this.screen = {x: 0, y: 0}
        this.board = {x: 0, y: 0}
    }

    updateScreenCoords(coords, persp){
        this.screen.x = coords.x;
        this.screen.y = coords.y;
        this.world.x = Math.floor((coords.x - this.display.xOff) / this.display.multiplier);
        this.world.y = Math.floor((coords.y - this.display.yOff) / this.display.multiplier);
        if (persp === -1) this.world = {x: 256 - this.world.x, y: 256 - this.world.y}
    }

    updateBoardCoords(){
        this.board = {x: Math.floor((this.world.x) / TILE), 
                      y: Math.floor((this.world.y) / TILE)};  
    }
}

export default Mouse;