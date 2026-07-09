import Pawn from './pieces/Pawn.js';
import Rook from './pieces/Rook.js';
import Knight from './pieces/Knight.js';
import Bishop from './pieces/Bishop.js';
import Queen from './pieces/Queen.js';
import King from './pieces/King.js';
import Cannibal from './pieces/Cannibal.js';
import Move from './move.js';
import { playMoveSound, playCaptureSound, playCannibalSound } from "./audio.js";
import P2P from './net/P2P.js';

class Game {
  constructor(id, cFen){
    this.id = id;
    this.boardOrientation = 1,
    this.selected = null,
    this.hovered = null,
    this.validMoves = [],
    this.history = [],
    this.boardIndex = 0,
    this.p2p = null;

    this.loadCFen(cFen);
    this.storePosition(cFen);
    
  }

  forEachSquare(callback) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        callback(x, y, this.getPiece({x, y}));
      }
    }
  }

  someSquare(predicate) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (predicate(x, y, this.getPiece({x, y}))) {
          return true;
        }
      }
    }
    return false;
  }

  setP2P(p2p){
    this.p2p = p2p;
  }

  getPiece(square){
    return this.board[square.y][square.x]
  }

  setPiece(square, piece){
    this.board[square.y][square.x] = piece
  }

  getOtherPlayer(){
    return this.currentPlayer === "white" ? "black" : "white"
  }

  getOtherColor(col){
    return col === "white" ? "black" : "white"
  }

  // ~ ~ ~ ~ ~ INIT ~ ~ ~ ~ ~ //

  loadCFen(cFen){
    const state = cFen.split(" ");
    this.createBoardFromString(state[0])
    this.currentPlayer = state[1];
    this.setCastlingRights(state[2]);
    this.epTarget = state[3];
  }

  createBoardFromString(theString){
    this.board = []
    const ranks = theString.split("/");
    for (let y = 0; y < 8; y++) {
      this.board[y] = []
      const squares = ranks[y].split(",");
      for (let x = 0; x < 8; x++) {
        if (squares[x] === "0"){
          this.setPiece({x, y}, null);
          continue;
        }
        this.setPiece({x, y}, this.createPiece(squares[x]));
      }
    }
  }

  setCastlingRights(rights){
    this.castlingRights = rights;
  }

  createPiece(label){
    const color = label === label.toLowerCase() ? "black" : "white"
    
    //base piece
    switch(label.toLowerCase()){
      case 'p' : return new Pawn(color)
      case 'n' : return new Knight(color)
      case 'b' : return new Bishop(color)
      case 'r' : return new Rook(color)
      case 'q' : return new Queen(color)
      case 'k' : return new King(color)
    }

    //cannibal
    const pieceList = [];
    for (const char of label) pieceList.push(this.createPiece(char));
    return new Cannibal(pieceList, label, color)
  }

  createCannibal(pieceList){
    const pieces = [];
    const labels = []
    for (const p of pieceList){
      if (pieces.some(piece => piece.constructor === p.constructor)) continue;
      pieces.push(p)
      labels.push(p.label)
    }

    labels.sort();
    const cannibalLabel = labels.join('')
    return new Cannibal(pieces, cannibalLabel, pieces[0].color)
  }

  getCFen(){
    //board
    let fen = "";
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (!this.getPiece({x, y})){
            fen += "0"
        } else {
            fen += this.getPiece({x, y}).label
        }
        if (x < 7) fen += ","
      }
      if (y < 7) fen += "/"
    }
    fen += " ";

    //whose move is it
    fen += this.currentPlayer;
    fen += " ";

    //castling
    if (this.castlingRights.length > 0){ fen += this.castlingRights; }
    else { fen += "-" }
    fen += " ";

    //enpassant
    if (this.epTarget){ fen += this.epTarget }   
    else { fen += "-" }
    fen += " ";

    return fen;
  }

// ~ ~ ~ ~ ~ INPUTS ~ ~ ~ ~ ~ //

  //coordinates of the square that was pressed
  onMouseDown(x, y){
    if (this.selected){

      //deselect when clicking the same piece twice
      if (this.selected.x === x && this.selected.y === y){
        this.deselect();
        return;
      }

      //execute a move
      const theMove = this.validMoves.find(move => this.squareEquals(move.to, {x, y}));
      if(theMove && this.currentPlayer === theMove.piece.color) {
        this.executeMove(theMove)
        this.playMoveAudio(theMove.type);
        this.storePosition(this.getCFen());
        this.deselect();
        this.checkForMate(theMove.piece.color)
        this.currentPlayer = this.getOtherPlayer();
        this.p2p.send(this.getCFen())
        return;
      } 
      
      //if not a valid move, deselect/reselect as necessary
      this.deselect();
      this.trySelect(x, y);
    }

    this.trySelect(x, y);
  }

  onMouseMove(x, y){
    if ( x < 0 || x > 7 || y < 0 || y > 7) return;
    if (!this.getPiece({x, y})) {
      this.hovered = null;
      return;
    }
    if(this.getPiece({x, y})){
      this.hovered = {x: x, y: y}
    }
  }

  onKeyDown(event){
    if (event.key.startsWith("Arrow")) event.preventDefault();
    switch(event.key){
      case "f" : this.boardOrientation *= -1; return;
      case "ArrowLeft" : this.tryRetreat(); return;
      case "ArrowRight" : this.tryAdvance(); return;
    }
  }

  playMoveAudio(t){
    if (t === "normal" || t === "castling" || t === "promotion" || t === "enPassantable") playMoveSound();
    if (t === "enPassant" || t === "capture")playCaptureSound();
    if (t === "cannibal") playCannibalSound();
  }

  // ~ ~ ~ ~ ~ LOGIC ~ ~ ~ ~ ~ //

  relocatePiece(from, to){
    this.setPiece(to, this.getPiece(from));
    this.setPiece(from, null);
  }

  executeMove(move){
    //all moves do this
    this.relocatePiece(move.from, move.to)

    //some moves do extra stuff
    switch (move.type){
      case "cannibal" : 
      const list = move.piece.getPieces().concat(move.target.getPieces())
      this.setPiece(move.to, this.createCannibal(list));
      break;

      case "castling" :
      this.executeCastling(move);
      break;

      case "enPassant" :
      this.executeEnPassant(move);  
      break;

    }  
    
    //enPassantable
    if (move.type === "enPassantable"){
      this.epTarget = {x: move.from.x, y: (move.from.y + move.to.y)/2}
    } else {
      this.epTarget = null;
    } 

    //castling state updates
    if (move.piece instanceof Rook){
      const lostRights = this.getRookSquare(move.from) + this.getRookSquare(move.to)
      for (const char of lostRights){
        this.castlingRights = this.castlingRights.replace(char, '');
      } 
    }
    if (move.piece instanceof King){
      const lostRights = move.piece.color === "white" ? "KQ" : "kq"
      for (const char of lostRights) {
        this.castlingRights = this.castlingRights.replace(char, '');
      }
    }

  }

  executeEnPassant(move){
    if (move.to.y === 2) {this.setPiece({x: move.to.x, y: 3}, null);}
    else this.setPiece({x: move.to.x, y: 4}, null);
  }

  executeCastling(move){
    const rookCoords = move.to.x > move.from.x ? {x: 7, y: move.from.y} : {x: 0, y: move.from.y}
    const newCoords = rookCoords.x === 7 ? {x: 5, y: rookCoords.y} : {x: 3, y: rookCoords.y}
    this.relocatePiece(rookCoords, newCoords)
  }

  checkForMate(whoMoved){
    let legalMoves = 0;
    const otherPlayer = this.getOtherColor(whoMoved)
    const kingAttacked = this.isKingAttacked(otherPlayer)
    this.forEachSquare((x, y, piece) => {
      if (piece && piece.color === otherPlayer){
        legalMoves += this.getValidMoves({x, y}).length
      } 
    })
    if (legalMoves === 0){
      console.log(kingAttacked ? "checkmate" : "stalemate")
    }

  }

  getKing(color){
    let square;
    this.forEachSquare((x, y, piece) => {
      if (piece && piece instanceof King && piece.color === color) square = {x: x, y: y}
    });
    return square;
  }
  
  isSquareAttacked(square, color){
    return this.someSquare((x, y, piece) => {
      if (!piece) return false;
      if (piece.color != color) return false;
      return this.tryCreateMove({x, y}, square)   
    });
  }

  isKingAttacked(color){
    const square = this.getKing(color);
    return this.isSquareAttacked(square, this.getOtherColor(color))
  }

  resultsInEnemyCheck(move){
    const newGame = new Game(crypto.randomUUID(), this.getCFen());
    newGame.executeMove(move); 
    if (newGame.isKingAttacked(move.piece.color)) return true;
    return false;
  }

  getRookSquare(square){
    if (square.x === 0 && square.y === 0)return "q";
    if (square.x === 0 && square.y === 7)return "Q";
    if (square.x === 7 && square.y === 0)return "k";
    if (square.x === 7 && square.y === 7)return "K";
    return "";
  }

  squareEquals(s1, s2){
    return s1.x === s2.x && s1.y === s2.y;
  }

  storePosition(cfen){
    this.history.push(cfen)
    this.boardIndex = this.history.length - 1;
  }

  tryRetreat(){
    if (this.boardIndex > 0){
      this.boardIndex--;
      this.loadCFen(this.history[this.boardIndex])
    }
  }

  tryAdvance(){
    if (this.boardIndex < this.history.length-1){
      this.boardIndex++;
      this.loadCFen(this.history[this.boardIndex])
    }
  }

  trySelect(x, y){
    const piece = this.getPiece({x, y});
    if (piece){
      this.selected = {x: x, y: y}
      this.updateValidMoves(this.selected);
    }  
  }

  deselect(){
    this.selected = null;
    this.validMoves = [];
  }

  updateValidMoves(from) {
    this.validMoves.length = 0;
    this.validMoves = this.getValidMoves(from)
  }

  getValidMoves(from) {
    const moves = []
    this.forEachSquare((x, y, target) => {
      const move = this.tryCreateMove(from, {x, y})
      if (move && !this.resultsInEnemyCheck(move)) moves.push(move);
    });
    return moves;
  }

  //returns candidate move if valid
  tryCreateMove(from, to){
    if (!this.moveIsGenerallyValid(from, to)) return false;
    const type = this.defineMove(from, to);
    if (type) return new Move(this.getPiece(from), from, to, this.getPiece(to), type)
    return false;
  }

  moveIsGenerallyValid(from, to){
    if (!from || !to) return false;
    if (!this.getPiece(from).sees(from, to)) return false;             
    if (this.isFriendlyKing(this.getPiece(from), this.getPiece(to))) return false; 
    if (!this.clearPath(from, to)) return false;     
    return true;   
  }

  //piece/context specific validation
  defineMove(from, to){
    switch(this.getPiece(from).constructor){
      case Pawn: return this.validatePawnMove(from, to);
      case King: return this.validateKingMove(from, to); 
      case Cannibal: return this.validateCannibalMove(from, to); 
      default: return this.validateNormalMove(from, to);
   }
  }

  isFriendlyKing(p1, p2){
    return p1 && p2 && p1.color === p2.color && (p1 instanceof King || p2 instanceof King)
  }

  clearPath(from, to) {
    if (this.isKnightMove(from, to)) return true;
    if (from.x === to.x && from.y === to.y) return false;
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    let x = from.x + dx;
    let y = from.y + dy;
    while (x !== to.x || y !== to.y) {
      if (this.getPiece({x, y})) return false;
      x += dx;
      y += dy;
    }
    return true;
  }

  isKnightMove(from, to){
    const dx = to.x-from.x;
    const dy = to.y-from.y;
    if (!((Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2))) return false;
    return true;
  }

  validatePawnMove(from, to){
    const piece = this.getPiece(from);
    const target = this.getPiece(to);

    if (target && to.x-from.x === 0) return false;
    if (Math.abs(to.y-from.y) === 2 && !(from.y === piece.getStartingRank())) return false;

    if (Math.abs(to.x-from.x) === 1 && to.y-from.y === piece.dir){
      if (this.epTarget && this.squareEquals(this.epTarget, to)) return "enPassant"
      if (!target) return false;
      return this.validateNormalMove(from, to);
    }

    if (Math.abs(to.y-from.y) === 2) return "enPassantable"

    return this.validateNormalMove(from, to);
  }

  validateKingMove(from, to){
    const king = this.getPiece(from);
    if (Math.abs(to.x - from.x) === 2) return this.validateCastling(king, from, to)
    return this.validateNormalMove(from, to);
  }

  validateCastling(king, from, to){
    //first check if the king has the rights
    const rightInQuestion = this.determineRight(king, from, to)
    if (!this.castlingRights.includes(rightInQuestion)) return false;

    //then determine if the king square or intermediate square is attacked
    const intermediateSquare = {x: ((from.x + to.x) / 2), y: from.y}
    const col = this.getOtherColor(king.color)
    if (this.isSquareAttacked(from, col)) return false;
    if (this.isSquareAttacked(intermediateSquare, col)) return false;
    return "castling"
  }

  determineRight(king, from, to){
    if (king.color === "white"){
      if (to.x < from.x)return "Q";
      if (to.x > from.x)return "K";
    }
    if (king.color === "black"){
      if (to.x < from.x)return "q";
      if (to.x > from.x)return "k";
    }
    return "f"
  }

  validateCannibalMove(from, to){
    let move = null;
    for (const piece of this.getPiece(from).getPieces()){
      const newGame = new Game(crypto.randomUUID(), this.getCFen());
      newGame.setPiece(from, piece);
      move = newGame.tryCreateMove(from, to);
      if (move) break;
    }

    //this code makes special moves illegal for cannibals
    if (move){
      switch (move.type){
        case "enPassant": return false;
        case "promotion": return false;
      }
    } else return false;

    return this.validateNormalMove(from, to);
  }

  //default move type assignment
  validateNormalMove(from, to){
    const piece = this.getPiece(from);
    const target = this.getPiece(to);
    if (!target) return "normal"
    if (target.color === piece.color) return "cannibal"
    if (target.color != piece.color) return "capture"
  }
}

export default Game;