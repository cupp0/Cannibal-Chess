import Pawn from './pieces/Pawn.js';
import Rook from './pieces/Rook.js';
import Knight from './pieces/Knight.js';
import Bishop from './pieces/Bishop.js';
import Queen from './pieces/Queen.js';
import King from './pieces/King.js';
import Cannibal from './pieces/Cannibal.js';
import {playSound} from "./audio.js";
import Move from './move.js';
import Action from './net/action.js';
import PieceDrag from './drag.js';
import {getTime} from './main.js'

class Game {
  constructor(id, cFen, me, you, anim){
    this.id = id,
    this.me = me,
    this.you = you,
    this.boardOrientation = 1,
    this.selected = null,
    this.hovered = null,
    this.validMoves = [],
    this.history = [],
    this.boardIndex = 0,
    this.p2p = null;
    this.setPlayerColors(this.me, ["black", "white"]);
    this.loadCFen(cFen);
    this.storePosition(cFen);
    this.initAnimStuff(anim)
  }

  initAnimStuff(animations){
    this.onMove = event => {
      animations.animateMove(
          getTime(), 
          event.theMove,
          this.boardOrientation
      )
    };
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

  setOpponent(opp){
    this.you = opp;
  }

  setP2P(p2p){
    this.p2p = p2p;
  }

  updatePeer(mouse){
    if (getTime() % this.me.refreshTime === 0) this.p2p.send(new Action("hand", mouse.world));
    this.you.update();
    this.checkForHandShake();
  }

  //Is this doing too much
  setupOnlineGame(isHost){
      //this.me.setPerspective(isHost ? 1 : -1)
      this.you.active = true;    
      this.you.setHandAction("handExtended")
      this.me.setHandAction("handExtended")
      this.setPlayerColors(this.me, isHost ? ["white"] : ["black"])
      this.setPlayerColors(this.you, isHost ? ["black"] : ["white"])
      this.handShakeComplete = false;
  }

  //list of colors this machine can move 
  setPlayerColors(player, colors){
    if (!player) return;
    player.setColors(colors);
  }

  getPiece(square){
    try{
    return this.board[square.y][square.x]
    } catch (TypeError){
      console.log(square)
    }
  }

  getHover(){
    if (this.hovered) return this.hovered
    return false;
  }

  getSelected(){
    if(this.selected) return this.selected
    return false;
  }

  isHovered(x, y){
    if (!this.hovered) return false;
    return this.hovered.x === x && this.hovered.y === y;
  }

  isSelected(x, y){
    if (!this.selected) return false;
    return this.selected.x === x && this.selected.y === y;
  }

  isDragging(x, y){
    if (!this.currentDrag) return false;
    return this.currentDrag.square.x === x && this.currentDrag.square.y === y;
  }

  setDrag(theDrag, isLocalSource){
    this.currentDrag = theDrag;
    if (theDrag && theDrag.player){
        if (isLocalSource)this.me.setHandAction("handGrab")
          else this.you.setHandAction("handGrab")
    } else {
      this.updateHandAction();
    }
    
    if (this.p2p && isLocalSource){
        this.p2p.send(new Action("drag", this.currentDrag))
    }
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
    if (this.epTarget){ fen += String(this.epTarget.x)+String(this.epTarget.y) }   
    else { fen += "-" }
    fen += " ";

    return fen;
  }

// ~ ~ ~ ~ ~ INPUTS ~ ~ ~ ~ ~ //

  //coordinates of the square that was pressed
  onMouseDown(x, y){

    //do nothing for now if its not this players turn
    if (!this.me.colors.includes(this.currentPlayer)) return;

    if (this.selected){

      //execute a move
      const theMove = this.validMoves.find(move => this.squareEquals(move.to, {x, y}));
      if(theMove && this.currentPlayer === theMove.piece.color) {
        this.executeLiveMove(theMove, true);
        
        return;
      } 
      
      //if not a valid move, deselect/reselect as necessary
      this.deselect();
      this.trySelect(x, y);
    }

    this.trySelect(x, y);

    if (this.selected){
      this.setDrag(new PieceDrag(this.me, this.selected), true)
    }
  }

  onMouseMove(x, y){
    if ( x < 0 || x > 7 || y < 0 || y > 7) return;
    if (!this.getPiece({x, y})) {
      this.hovered = null;
      return;
    }
    if(this.me.colors.includes(this.getPiece({x, y}).color)){
      this.hovered = {x: x, y: y}
    }
  }

  onMouseUp(x, y){

    if (!this.me.colors.includes(this.currentPlayer)) return;

    if (this.currentDrag){
      
      //execute a move
      const theMove = this.validMoves.find(move => this.squareEquals(move.to, {x, y}));
      if(theMove && this.currentPlayer === theMove.piece.color) {
        this.executeLiveMove(theMove, true);
        return;
      } else {
        this.updateHandAction();
      }

      this.setDrag(null, true);
    }

    this.deselect();
  }

  onKeyDown(event){
    //if (event.key.startsWith("Arrow")) event.preventDefault();
    // switch(event.key){
    //   case "ArrowLeft" : this.tryRetreat(); return;
    //   case "ArrowRight" : this.tryAdvance(); return;
    // }
  }

  playMoveAudio(t){
    if (t === "normal" || t === "castling" || t === "enPassantable") playSound("move");
    if (t === "enPassant" || t === "capture")playSound("capture");
    if (t === "cannibal") playSound("cannibal");
    if (t === "promotion") playSound("ring");
  }

  // ~ ~ ~ ~ ~ LOGIC ~ ~ ~ ~ ~ //

  relocatePiece(from, to){
    this.setPiece(to, this.getPiece(from));
    this.setPiece(from, null);
  }

  executeLiveMove(theMove, isLocalSource){
    this.executeMove(theMove)
    this.currentPlayer = this.getOtherPlayer();
    this.playMoveAudio(theMove.type);
    this.storePosition(this.getCFen());
    this.deselect();
    this.checkForMate(theMove.piece.color)
    this.updateHandAction();
    if (this.p2p && isLocalSource){
        this.p2p.send(new Action("move", theMove))
    }
    
    this.onMove?.({
        theMove
    });

  }

  //assumes normal open/closed hand
  updateHandAction(){
    if (!this.handShakeComplete){
      this.me.setHandAction("handExtended")
      this.you.setHandAction("handExtended")
      return;
    }
    const myTurn = this.me.colors.includes(this.currentPlayer);
    this.me.setHandAction(myTurn ? "handPointing" : "handClosed")
    this.you.setHandAction(myTurn ? "handClosed" : "handPointing")
  }

  receivePeerMove(theMove){
    this.executeLiveMove(this.tryCreateMove(theMove.from, theMove.to), false)
  }

  receiveHandUpdate(opp){
    this.you.setTargetPos(opp.x, opp.y)
  }

  receiveDragUpdate(drag){
    if (!drag){this.setDrag(null, false); return;}
    this.setDrag(new PieceDrag(drag.player, drag.square), false)
  }

  receiveHandShake(){
      this.activeHandShake = true;
      this.handShakeComplete = true;
  }

  executeMove(move){
    //all moves do this
    this.relocatePiece(move.from, move.to)

    //some moves do extra stuff
    switch (move.type){
      case "cannibal" : 
      this.executeCannibalMove(move);
      break;

      case "castling" :
      this.executeCastling(move);
      break;

      case "enPassant" :
      this.executeEnPassant(move);  
      break;

      case "promotion":
      this.executePromotion(move);
      break;

    }  
    
    //enPassantable
    if (move.type === "enPassantable"){
      this.epTarget = {x: move.from.x, y: (move.from.y + move.to.y)/2}
    } else {
      this.epTarget = null;
    } 

    //castling state updates
    if (move.piece instanceof Rook || move.target instanceof Rook){
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

  executeCannibalMove(move){
    const list = move.piece.getPieces().concat(move.target.getPieces())
    this.setPiece(move.to, this.createCannibal(list));
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

  executePromotion(move){
    //regular promotion
    if (move.piece instanceof Pawn){
      const newPiece = this.createPiece(move.piece.color === "black" ? "q" : "Q")
      this.setPiece(move.to, newPiece)
    } 
    
    //cannibal promotion
    else {
      
      let label = move.piece.label;
      const pawn = move.piece.color === "black" ? "p" : "P"
      const queen = move.piece.color === "black" ? "q" : "Q"     

      if (label.toLowerCase().includes("q")){
          label = label.replace(pawn, '');
      } else {
          label = label.replace(pawn, queen)
      }

      this.setPiece(move.to, this.createPiece(label))
    }
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
      this.onGameEnd();
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

  checkForHandShake(){
    const mePos = {x:this.me.pos.x, y:this.me.pos.y +32 * this.me.perspective};
    const youPos = this.you.pos;
    const dist = {x: Math.abs(mePos.x - youPos.x), y: Math.abs(mePos.y - youPos.y)}
    const shake = dist.x < 15 && dist.y < 15
    if (this.activeHandShake === false){
        if (shake){
            this.activeHandShake = true;
            this.handShakeComplete = true;
            this.p2p.send(new Action("handshake", ""))
            this.you.setHandAction("handShake")
            this.me.setHandAction("handShake")
        } else {
            this.activeHandShake = false;
        }
    } else {
      if (shake) return;
      this.activeHandShake = false;
      this.updateHandAction();
    }
  }

  trySelect(x, y){
    if (this.handShakeComplete === false) return;
    const piece = this.getPiece({x, y});
    if (piece){
      if (!this.me.colors.includes(piece.color)) return;
      this.selected = {x: x, y: y}
      this.updateValidMoves(this.selected);
    }  
  }

  deselect(){
    this.selected = null;
    this.validMoves = [];
    this.setDrag(null, false)
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
    }

    if (Math.abs(to.y-from.y) === 2) return "enPassantable"

    if (to.y === 7 || to.y === 0) return "promotion"

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
      }
    } else return false;

    if (move && this.isCannibalPromoting(this.getPiece(from), move.to)){
      return "promotion"
    }

    return this.validateNormalMove(from, to);
  }

  isCannibalPromoting(piece, to){

    const isPromotionSquare = 
    (to.y === 7 && piece.color === "black") ||
    (to.y === 0 && piece.color === "white");

    const cannibalContainsPawn = piece.getPieces().some(p => p instanceof Pawn);
    
    return (isPromotionSquare && cannibalContainsPawn)
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