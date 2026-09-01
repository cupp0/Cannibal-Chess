export default class Piece {
  
  constructor(label, color){
    this.color = color;
    this.label = this.color === "black" ? label : label.toUpperCase();
    this.posOffset = {x: 0, y: 0}
  }

  //cannibal overrides
  getPieces(){
    return [this];
  }

  shake(amount){
    const shake = {x: Math.round((Math.random() - .5 ) * amount), y: Math.round((Math.random() - .5 ) * amount)}
    this.posOffset = {x: this.posOffset.x + shake.x, y: this.posOffset.y + shake.y}
  }

  getAssetString(){
    return this.color+"-"+this.label.toLowerCase();
  }

  isZontan(){
    return (this.getPieces().length === 5)
  }

}