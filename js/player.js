export default class Player{

    constructor(x, y){
        this.setPos(x, y)
        this.active = false;
    }

    setPos(x, y){
        this.x = x; this.y = y;
    }
}