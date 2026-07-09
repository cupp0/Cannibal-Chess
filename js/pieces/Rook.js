import Piece from './Piece.js';

export default class Rook extends Piece{
  constructor(color){
    super("r", color)
  }

  sees(from, to){
    const dx = to.x-from.x;
    const dy = to.y-from.y;
    if (dx !== 0 && dy !== 0) return false;
    return true;
  }
}