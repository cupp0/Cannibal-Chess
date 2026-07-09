import Piece from './Piece.js';

export default class Knight extends Piece{
  constructor(color){
    super("n", color)
  }

  sees(from, to){
    const absX = Math.abs(to.x-from.x);
    const absY = Math.abs(to.y-from.y);
    if (!((absX === 1 && absY === 2) || (absX === 2 && absY === 1))) return false;
    return true;
  }
}