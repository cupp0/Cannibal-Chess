import Piece from './Piece.js';

export default class Pawn extends Piece{
  constructor(color){
    super("p", color)
    this.dir = color === "white" ? -1 : 1
  }

  sees(from, to){
    const dx = to.x - from.x
    const dy = to.y - from.y
    if (Math.abs(dx) > 1 || Math.abs(dy) > 2)return false;
    if (Math.sign(dy) !== Math.sign(this.dir)) return false;
    if (Math.abs(dx) === 1 && Math.abs(dy) === 2)return false;
    return true;
  }

  getStartingRank(){
    return this.color === "white" ? 6 : 1;
  }
}