export default class Piece {
  
  constructor(label, color){
    this.color = color;
    this.label = this.color === "black" ? label : label.toUpperCase();
  }

  //cannibal overrides
  getPieces(){
    return [this];
  }

  getAssetString(){
    return this.color+"-"+this.label.toLowerCase();
  }

}