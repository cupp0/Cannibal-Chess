const TILE = 32;
const MOVEDOT = 8;
const assetBuffers = new Map()
const spriteNames = [
  "white-k",
  "black-k",
  "playoffline",
  "host",
  "join",
  "titlesplash",
  "hand",
  "closedHand",
  "handShake",
  "clockBody",
  "clockButtonUp",
  "clockButtonDown",
  "clockTimerKnob"
];

addPieceSpriteNames();
const flippers = ["hand", "closedHand", "clockBody", "clockButtonUp", "clockButtonDown", "clockTimerKnob"]
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

function addPieceSpriteNames(){
    const pieceOrder = ['b', 'n', 'p', 'q', 'r']    
    for (const i of generateCombinations(5)){
        let pieceComb = "";
        for (const j of i){
        pieceComb += pieceOrder[j];
        }

        const wName = "white-"+pieceComb
        const bName = "black-"+pieceComb
        spriteNames.push(wName);
        spriteNames.push(bName);
    }
}

export async function loadBuffers(){
    for (const name of spriteNames) {
      const buffer = await addBuffer(name);
      assetBuffers.set(name, buffer)
    }
}

async function addBuffer(name){
    const img = new Image();
    img.src = "./assets/sprites/"+name+".png"

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

export function drawBoard(ctx) {
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
export function drawPieces(ctx, game, animations, mouse){
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
    {x: mouse.world.x - 16, y: mouse.world.y-16} :
    {x: 256 - game.you.pos.x - 16 , y: 256 - game.you.pos.y - 16}
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

export function drawPlayers(ctx, game, mouse){

  if (game.activeHandShake){
      const handshakeBuffer = assetBuffers.get("flippedHandShake");
      const mePos = {x: mouse.world.x - 12 , y: mouse.world.y - 8}

      renderBuffer(ctx, handshakeBuffer, mePos.x, mePos.y )
      drawArm(ctx, mePos, 1)
      drawArm(ctx, mePos, -1)

      return;
  }

  //render opponent
  if (game.you.active) {
      const renderedHand = game.you.colors.includes(game.currentPlayer) ?
      assetBuffers.get("flippedHand") : assetBuffers.get("flippedClosedHand");
      const youPos = {x: 256 - game.you.pos.x - 12 , y: 256 - game.you.pos.y - 18}

      renderBuffer(ctx, renderedHand, youPos.x , youPos.y)
      drawArm(ctx, youPos, -1)
  }

  //render me
  const hand = game.me.colors.includes(game.currentPlayer) ?
  assetBuffers.get("hand") : assetBuffers.get("closedHand")
  const mePos = {x: mouse.world.x - 13 , y: mouse.world.y - 3}

  renderBuffer(ctx, hand, mePos.x, mePos.y )
  drawArm(ctx, mePos, 1)
  
}

//p = buffer position, o = orientation
function drawArm(ctx, p, o){
  const xOff = 11.5
  const yOff = o === 1? 32 : 0;
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

function flipBuffer(buffer, horizontal, vertical){
  const newBuffer = []
  for (let y = 0; y < buffer.length; y++){
    newBuffer[y] = [];
    for (let x = 0; x < buffer[y].length; x++){
      if (vertical && !horizontal){
          newBuffer[y][x] = buffer[buffer.length - 1 - y][x]
      }
      if (horizontal && !vertical){
          newBuffer[y][x] = buffer[y][buffer[y].length - 1 - x]
      }
      if (horizontal && vertical){
          newBuffer[y][x] = buffer[buffer.length - 1 - y][buffer[y].length - 1 - x]
      }
    }
  }
  return newBuffer
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
    const finalPos = {x: Math.floor(xPos), y: Math.floor(yPos)}
    if(!b)return;
    forEachPixel(b, (x, y) =>{
        ctx.fillStyle = `rgba(${b[y][x][0]},${b[y][x][1]},${b[y][x][2]},${b[y][x][3]})`;
        ctx.fillRect(finalPos.x + x , finalPos.y + y, 1.1, 1.1);
    })
}

export function renderMessage(msg){
  //render box then text
}

export function drawMoveDots(ctx, game) {
    
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
            renderBuffer(ctx, buffer, widget.x, widget.y);
        } else {
            widget.draw(ctx);
        }
      }

}

//get board position from display
export function drawClock(clock, ctx) {
    renderBuffer(ctx, assetBuffers.get("clockBody"), clock.pos.x, clock.pos.y);
    for (const widget of clock.widgets){
        const buffer = assetBuffers.get(widget.name);
        if (buffer) renderBuffer(ctx, buffer, widget.x, widget.y);
    }
        ctx.strokeStyle = 'black'

    renderClockHands(ctx, clock.blackTime, clock.pos.x+21, clock.pos.y + 21);
    renderClockHands(ctx, clock.whiteTime, clock.pos.x+21, clock.pos.y + 69);
}

function renderClockHands(ctx, ms, x, y){
    const time = ms / 1000;
    const radius = 16;
    const seconds = time % 60;
    const minutes = (time / 60) % 60;

    // Angles in radians.
    // 0 rad = 3 o'clock = your rotated 12 o'clock.
    const secondAngle = (seconds / 60) * Math.PI * 2;
    const minuteAngle = (minutes / 60) * Math.PI * 2;

    const secondLength = radius * 0.9;
    const minuteLength = radius * 0.65;

    ctx.beginPath();

    // Minute hand
    ctx.moveTo(x, y);
    ctx.lineTo(
        x + Math.cos(minuteAngle) * minuteLength,
        y + Math.sin(minuteAngle) * minuteLength
    );

    // Second hand
    ctx.moveTo(x, y);
    ctx.lineTo(
        x + Math.cos(secondAngle) * secondLength,
        y + Math.sin(secondAngle) * secondLength
    );

    ctx.stroke();
}