import Piece from './Piece.js';

export default class Cannibal extends Piece{
  constructor(pieces, label, color) {
    super(label, color)
    this.pieces = pieces;
  } 

  getPieces(){
    return this.pieces;
  }

  sees(from, to){
    for (const p of this.pieces){
      if (p.sees(from, to)){
        return true;
      }
    }
    return false;
  }

}