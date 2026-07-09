import Piece from './Piece.js';

export default class Queen extends Piece{
  constructor(color){
    super("q", color)
  }

  sees(from, to){
    const absX = Math.abs(to.x-from.x);
    const absY = Math.abs(to.y-from.y);
    const dx = to.x-from.x;
    const dy = to.y-from.y;
    if ((absX !== absY) && (dx !== 0 && dy !== 0)) return false;
    return true; 
  }
}