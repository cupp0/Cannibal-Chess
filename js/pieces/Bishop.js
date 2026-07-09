import Piece from './Piece.js';

export default class Bishop extends Piece{
  constructor(color){
    super("b", color)
  }

  sees(from, to){
    const absX = Math.abs(to.x-from.x);
    const absY = Math.abs(to.y-from.y);
    if (absX !== absY) return false;
    return true; 
  }

}