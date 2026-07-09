import Piece from './Piece.js';

export default class King extends Piece{
  constructor(color){
    super("k", color);
  }

  sees(from, to){
    const dx = to.x - from.x
    const dy = to.y - from.y
    if (this.canCastle(from, to)) return true;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return false;
    return true;
  }

  canCastle(from, to){
    const start = this.getStartSquare();
    if (!(from.x === start.x && from.y === start.y)) return false;
    if (Math.abs(to.x-from.x) !== 2 || Math.abs(to.y-from.y) !== 0) return false;
    return true;
  }

  getStartSquare(){
    return this.color === "white" ? {x: 4, y: 7} : {x: 4, y: 0}
  }

}