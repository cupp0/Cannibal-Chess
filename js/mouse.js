const TILE = 32;

class Mouse{
    constructor(display){
        this.display = display;
        this.world = {x: 0, y: 0}
        this.screen = {x: 0, y: 0}
        this.board = {x: 0, y: 0}
    }

    updateScreenCoords(coords){
        this.screen.x = coords.x;
        this.screen.y = coords.y;
        this.world.x = Math.floor((coords.x - this.display.xOff) / this.display.multiplier);
        this.world.y = Math.floor((coords.y - this.display.yOff) / this.display.multiplier);
    }

    updateBoardCoords(game){
        const sx = Math.floor((this.world.x) / TILE);  
        const sy = Math.floor((this.world.y) / TILE);  
        this.board.x = game.boardOrientation === 1 ? sx : 7-sx;
        this.board.y = game.boardOrientation === 1 ? sy : 7-sy;
    }
}

export default Mouse;