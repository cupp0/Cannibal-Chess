const TILE = 32;
const MOVEDOT = 8;
const assetBuffers = new Map()
const menuSpriteNames = [
    "playoffline",
    "host",
    "join",
    "titlesplash"
];
const handSpriteNames = [
    "handClosed", 
    "handExtended",
    "handGrab",
    "handPointing",
    "handShake"
]

const clockSpriteNames = [
    "clockBody",
    "clockButtonUp",
    "clockButtonDown",
    "clockTimerKnob"
]

const pieceSpriteNames = addPieceSpriteNames();
let menuStartTime = 0;

function forEachSquare(callback) {
  for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
          callback(x, y);
      }
  }
}

function forEachPixel(buffer, callback) {
    for (let y = 0; y < buffer.length; y++) {
        for (let x = 0; x < buffer[y].length; x++) {
            callback(x, y);
        }
    }
}

//way more text that just writing out all the pieces haha
function addPieceSpriteNames(){
    const l = []
    l.push("white-k");
    l.push("black-k");
    const pieceOrder = ['b', 'n', 'p', 'q', 'r']    
    for (const i of generateCombinations(5)){
        let pieceComb = "";
        for (const j of i){
            pieceComb += pieceOrder[j];
        }
        const wName = "white-"+pieceComb
        const bName = "black-"+pieceComb
        l.push(wName);
        l.push(bName);
    }
    return l;
}

function generateCombinations(n) {
    const result = [];
    function backtrack(start, combo) {
        if (combo.length > 0) {
            result.push([...combo]);
        }
        for (let i = start; i < n; i++) {
            combo.push(i);
            backtrack(i + 1, combo);
            combo.pop();
        }
    }
    backtrack(0, []);
    return result;
}

export async function initBuffers(page){
  await loadBuffers();
  page.setState("awaitingClick")
}

async function loadBuffers(){
    for (const name of menuSpriteNames) {
      const buffer = await addBuffer("menu", name);
      assetBuffers.set(name, buffer)
    }
    for (const name of handSpriteNames) {
      const buffer = await addBuffer("hand", name);
      assetBuffers.set(name, buffer)
    }
    for (const name of clockSpriteNames) {
      const buffer = await addBuffer("clock", name);
      assetBuffers.set(name, buffer)
    }
    for (const name of pieceSpriteNames) {
      const buffer = await addBuffer("pieces", name);
      assetBuffers.set(name, buffer)
    }
}

async function addBuffer(location, name){
    const img = new Image();
    img.src = "./assets/sprites/"+location+"/"+name+".png"

    await img.decode();
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
    const pixels = imageData.data;
    const buffer = []
    for (let y = 0; y < img.height; y++) {
        buffer[y] = []
        for (let x = 0; x < img.width; x++) {
        const i = ((y * img.width + x) * 4);
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];
        let a = pixels[i + 3] / 255; // normalize alpha 0-1
        buffer[y][x] = [r, g, b, a];
        }
    }
    return buffer;
}

export function getBuffer(name){
  return assetBuffers.get(name)
}

function drawBoard(ctx) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? 
        "rgba(180, 168, 130, 255)" : 
        "rgba(28, 34, 47, 255)";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    ctx.strokeStyle = 'black'; 
    ctx.lineWidth = 1;          

    for (let x = 0; x < 9; x++) {
      ctx.beginPath();           
      ctx.moveTo(x*32, 0);          
      ctx.lineTo(x*32, 264); 
      ctx.stroke(); 

      ctx.beginPath();           
      ctx.moveTo(0, x*32);         
      ctx.lineTo(264, x*32); 
      ctx.stroke(); 
    }
}

//pass animations so we know which squares to not render during animation
function drawPieces(ctx, game, animations, mouse){
  forEachSquare((x, y) => {
      if (!game.board[y][x]) return;
      if (animations.isSquareAnimated(x, y, game.boardOrientation)) return;
      if (game.isDragging(x, y)){drawDraggedPiece(ctx, game, x, y, mouse); return;}
      drawPiece(game, x, y, ctx);
  })
}

function drawPiece(game, squareX, squareY, ctx){
    const piece = game.board[squareY][squareX];
    const buffer = assetBuffers.get(piece.getAssetString());
    const actualTile = game.boardOrientation === 1 ? {x: squareX, y: squareY} : {x: 7-squareX, y: 7-squareY}
    const pos = {x: actualTile.x * TILE, y: actualTile.y * TILE}

    if (piece.label.toLowerCase() === "k" && game.isKingAttacked(piece.color)){
        renderBuffer(ctx, highlightBuffer(buffer, 127, "red"), pos.x, pos.y)
        return;
    }

    let highlight = 0;
    if (game.isHovered(squareX, squareY)) highlight += 127;
    if (game.isSelected(squareX, squareY)) highlight += 127;
    if (highlight > 0)renderBuffer(ctx, highlightBuffer(buffer, highlight, "gray"), pos.x, pos.y)
    else renderBuffer(ctx, buffer, pos.x, pos.y)
}

function drawDraggedPiece(ctx, game, squareX, squareY, mouse){
    const buffer = assetBuffers.get(game.board[squareY][squareX].getAssetString());
    const pos = game.me.colors.includes(game.board[squareY][squareX].color) ?
    toScreen({x: mouse.world.x-(14*game.me.perspective), y: mouse.world.y-(6*game.me.perspective)}, game.me.perspective):
    toScreen({x: game.you.pos.x -(18*game.me.perspective), y: game.you.pos.y-32*game.me.perspective}, game.me.perspective)
    renderBuffer(ctx, highlightBuffer(buffer, 255, "gray"), pos.x, pos.y)
}

function highlightBuffer(buffer, amount, type){  
  const newBuffer = []
  for (let y = 0; y < buffer.length; y++){
    newBuffer[y] = [];
    for (let x = 0; x < buffer[y].length; x++){
      if (buffer[y][x][0] + buffer[y][x][1] + buffer[y][x][2] === 0 && buffer[y][x][3] === 1){
        switch(type){
          case "gray" :
          newBuffer[y][x] = [amount, amount , amount, 1]; break;
          case "red" :
          newBuffer[y][x] = [amount, 0 , 0, 1]; break;
          case "green" :
          newBuffer[y][x] = [0, amount , 0, 1]; break;
          case "blue" :
          newBuffer[y][x] = [0, 0 , amount, 1]; break;
        }
      } else {
        newBuffer[y][x] = buffer[y][x];
      }
    }
  }
  return newBuffer
}

function drawPlayers(ctx, game, mouse){

  if (game.activeHandShake){
      const mePos = {x:game.me.relPos.x - 14, y: game.me.relPos.y};
      renderBuffer(ctx, assetBuffers.get("handShake"), mePos.x, mePos.y )
      drawArm(ctx, mePos, 1)
      drawArm(ctx, {x:mePos.x+32, y: mePos.y+32}, -1)
      return;
  }

  const myHand = game.me.handAction;
  const yourHand = game.you.handAction;
  
  //render opponent
  if (game.you.active) {
      const offset = {x: 14*game.me.perspective, y: 0}
      const youPos = toScreen({x:game.you.pos.x+offset.x, y: game.you.pos.y+offset.y}, game.me.perspective)
      renderSharedBuffer(ctx, assetBuffers.get(yourHand), youPos.x , youPos.y, -1)
      drawArm(ctx, {x:youPos.x, y:youPos.y}, -1)
  }

  //render me
  const mePos = {x:game.me.relPos.x - 14, y: game.me.relPos.y};
  renderBuffer(ctx, assetBuffers.get(myHand), mePos.x, mePos.y)
  drawArm(ctx, {x:mePos.x, y:mePos.y}, 1)
  
}

//p = buffer position, o = orientation
function drawArm(ctx, p, o){
  const xOff = o === 1 ? 11.5 : -20.5
  const yOff = 31*o
  const leftOfWrist = {x: p.x+xOff, y: p.y+yOff}


  ctx.strokeStyle = 'black'; 
  ctx.lineWidth = 1.1;          
  ctx.beginPath();           
  ctx.moveTo(leftOfWrist.x, leftOfWrist.y);          
  ctx.lineTo(leftOfWrist.x, 500*o); 
  ctx.stroke(); 
  ctx.beginPath();           
  ctx.moveTo(leftOfWrist.x+9, leftOfWrist.y);          
  ctx.lineTo(leftOfWrist.x+9, 500*o);  
  ctx.stroke();
  ctx.strokeStyle = o === 1? 'rgba(238, 195, 154, 255)' : 'rgba(191, 153, 114, 255)';
  ctx.beginPath();           
  ctx.moveTo(leftOfWrist.x+1, leftOfWrist.y);          
  ctx.lineTo(leftOfWrist.x+1, 500*o); 
  ctx.stroke(); 
  ctx.fillStyle = `rgba(232, 186, 142, 255)`;
  ctx.fillRect(leftOfWrist.x+1.5, leftOfWrist.y , 6, 500*o);
  ctx.strokeStyle = o === 1?'rgba(191, 153, 114, 255)' : 'rgba(238, 195, 154, 255)';
  ctx.beginPath();           
  ctx.moveTo(leftOfWrist.x+8, leftOfWrist.y);          
  ctx.lineTo(leftOfWrist.x+8, 500*o);
  ctx.stroke(); 
}

export function dissolve(ctx, b1, b2, xPos, yPos, amount){
  const buffer = []
      for (let y = 0; y < b1.length; y++) {
          buffer[y] = []
          for (let x = 0; x < b1[y].length; x++) {
          let r = (1-amount)*b1[y][x][0] + amount*b2[y][x][0];
          let g = (1-amount)*b1[y][x][1] + amount*b2[y][x][1];
          let b = (1-amount)*b1[y][x][2] + amount*b2[y][x][2];
          let a = (1-amount)*b1[y][x][3] + amount*b2[y][x][3];
          buffer[y][x] = [r, g, b, a];
          }
      }
  renderBuffer(ctx, buffer, xPos, yPos)
}

export function renderSprite(ctx, name, xPos, yPos){
  renderBuffer(ctx, assetBuffers.get(name), xPos, yPos)
}

export function renderBuffer(ctx, b, xPos, yPos){
    if(!b){console.log("no buffer");return;}
    const finalPos = {x: Math.floor(xPos), y: Math.floor(yPos)}
    forEachPixel(b, (x, y) =>{
        ctx.fillStyle = `rgba(${b[y][x][0]},${b[y][x][1]},${b[y][x][2]},${b[y][x][3]})`;
        ctx.fillRect(finalPos.x + x , finalPos.y + y, 1.1, 1.1);
    })
}

export function renderSharedBuffer(ctx, b, xPos, yPos, persp){  
    if(!b){console.log("no buffer");return;}
    const finalPos = {x: Math.floor(xPos), y: Math.floor(yPos)}
    forEachPixel(b, (x, y) =>{
        ctx.fillStyle = `rgba(${b[y][x][0]},${b[y][x][1]},${b[y][x][2]},${b[y][x][3]})`;
        ctx.fillRect(finalPos.x + (x*persp) , finalPos.y + (y*persp), 1.1, 1.1);
    })
}

export function renderMessage(msg){
  //render box then text
}

function drawMoveDots(ctx, game) {
    
    for (const m of game.validMoves) {
      switch(m.type){
        case "normal" : ctx.fillStyle = "rgba(100, 100, 100, 0.5)"; break;
        case "castling" : ctx.fillStyle = "rgba(100, 100, 100, 0.5)"; break;
        case "cannibal" : ctx.fillStyle = "rgba(50, 255, 100, 0.25)"; break;
        case "capture" : ctx.fillStyle = "rgba(200, 50, 208, 0.25)"; break;
        case "enPassant" : ctx.fillStyle = "rgba(156, 66, 208, 0.25)"; break;
        case "enPassantable" : ctx.fillStyle = "rgba(100, 100, 100, 0.5)"; break;
        case "promotion" : ctx.fillStyle = "rgba(100, 100, 100, 0.5)"; break;
      }
      const actualTile = game.boardOrientation === 1 ? {x: m.to.x, y: m.to.y} : {x: 7-m.to.x, y: 7-m.to.y}
      ctx.beginPath();
      ctx.fillRect(
        actualTile.x * TILE,
        actualTile.y * TILE,
        32,
        32
      );

      // 2. Set the stroke color and line width
      ctx.strokeStyle = "rgba(255, 255, 255, .75)";
      ctx.lineWidth = 1;

      // 3. Draw the outlined rectangle
      ctx.strokeRect(actualTile.x * TILE,
              actualTile.y * TILE,
              32,
              32
      );
    }
}

export function menuAssetsLoaded(menu){
  if (!assetBuffers.get("titlesplash")) return false;
  if (!assetBuffers.get("host")) return false;
  if (!assetBuffers.get("join")) return false;
  if (!assetBuffers.get("playoffline")) return false;
  return true;
}

export function drawMenu(ctx, menu) {

      renderBuffer(ctx, assetBuffers.get("titlesplash"), 21, 88);

      for (const widget of menu.widgets){
        const buffer = assetBuffers.get(widget.name);
        if (buffer){
            const b = highlightBuffer(buffer, widget.hover? 255 : 0, "gray")
            renderBuffer(ctx, b, widget.x, widget.y);
        } else {
            widget.draw(ctx);
        }
      }

}

export function drawGame(ctx, overlayCtx, game, animations, mouse, display, overlay, clock){
  overlayCtx.clearRect(-display.xOff, -display.yOff, overlay.width, overlay.height);    
  drawClock(game, clock, overlayCtx);
  drawBoard(ctx);
  drawMoveDots(ctx, game);
  drawPieces(ctx, game, animations, mouse);
  drawPlayers(overlayCtx, game, mouse);
}

export function toScreen(pos, persp){
  if (persp === -1) return {x: 256 - pos.x, y: 256 - pos.y}
  return pos
}

function drawClock(game, clock, ctx) {
  const cPos = toScreen(clock.pos, game.me.perspective)
    renderSharedBuffer(ctx, assetBuffers.get("clockBody"), cPos.x, cPos.y, game.me.perspective);
    for (const widget of clock.widgets){
        const buffer = assetBuffers.get(widget.name);
        const wPos = toScreen({x:widget.x, y: widget.y}, game.me.perspective)
        if (buffer) renderSharedBuffer(ctx, buffer, wPos.x, wPos.y, game.me.perspective);
    }
    ctx.strokeStyle = 'black'
    renderClockHands(ctx, clock.blackTime, clock.pos.x+21, clock.pos.y+21, game.me.perspective);
    renderClockHands(ctx, clock.whiteTime, clock.pos.x+21, clock.pos.y+68, game.me.perspective);
}

function renderClockHands(ctx, ms, x, y, persp){

    const time = ms / 1000;
    const radius = 16;
    const seconds = time % 60;
    const minutes = (time / 60) % 60;

    const secondAngle = (seconds / 60) * Math.PI * 2;
    const minuteAngle = (minutes / 60) * Math.PI * 2;

    const secondLength = radius * 0.9;
    const minuteLength = radius * 0.65;

    const cPos = {x: x, y: y}
    const mPos = {x: x + Math.cos(minuteAngle) * minuteLength, y: y + Math.sin(minuteAngle) * minuteLength}
    const sPos = {x: x + Math.cos(secondAngle) * secondLength, y: y + Math.sin(secondAngle) * secondLength}

    ctx.fillStyle = "black" 
    ctx.fillRect(mPos.x, mPos.y, 1, 1);
    ctx.fillRect(sPos.x, sPos.y, 1, 1);
    for (let i = - 16; i < 16; i++){
      for (let j = - 16; j < 16; j++){
        const p = {x:x+i, y:y+j}
        if (distancePointToLineSegment(p.x, p.y, cPos.x, cPos.y, mPos.x, mPos.y) < 1){
           const point = toScreen(p, persp)
           ctx.fillRect(point.x, point.y, 1, 1);
        }
        if (distancePointToLineSegment(p.x, p.y, cPos.x, cPos.y, sPos.x, sPos.y) < .5){
           const point = toScreen(p, persp)
           ctx.fillRect(point.x, point.y, 1, 1);
        }
      }
    }
    
}

function distancePointToLineSegment(x0, y0, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    // If the segment is just a single point
    if (dx === 0 && dy === 0) {
        return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
    }

    // Calculate projection factor t (clamped between 0 and 1)
    let t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));

    // Find the closest point on the segment
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    // Return the distance from P to the closest point
    return Math.sqrt(Math.pow(x0 - closestX, 2) + Math.pow(y0 - closestY, 2));
}