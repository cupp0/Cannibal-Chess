
const TILE = 32;
const MOVEDOT = 8;
const assetBuffers = new Map()

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

initBuffers();
function initBuffers(){
    const pieceOrder = ['b', 'n', 'p', 'q', 'r']    
    for (const i of generateCombinations(5)){
        let pieceComb = "";
        for (const j of i){
        pieceComb += pieceOrder[j];
        }

        const wName = "white-"+pieceComb
        const bName = "black-"+pieceComb
        addBuffer(wName);
        addBuffer(bName);
    }
    addBuffer("white-k");
    addBuffer("black-k");
    addBuffer("playoffline");
    addBuffer("host");
    addBuffer("join");
    addBuffer("titlesplash");
    addBuffer("hand");
    assetBuffers.set("flippedHand", flipBuffer(assetBuffers.get("hand")))
}

function addBuffer(name){
    const img = new Image();
    //pngy pngy bo bngy banana fana fo fngy
    img.src = "./assets/sprites/"+name+".png"
    img.onload = function(){
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
        assetBuffers.set(String(name), buffer)
    } 
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
  
export function drawBackground(ctx){
    const r = Math.random()*255;
    const g = Math.random()*255;
    const b = Math.random()*255;
    ctx.fillStyle = 'rgba(62, 80, 48, 255)'
    ctx.fillRect(-5000, -5000, 10000, 10000);
}

export function drawBoard(ctx) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "rgba(160, 148, 130, 255)" : "rgba(18, 24, 37, 255)";
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
    const buffer = assetBuffers.get(game.board[squareY][squareX].getAssetString());
    const actualTile = game.boardOrientation === 1 ? {x: squareX, y: squareY} : {x: 7-squareX, y: 7-squareY}
    const pos = {x: actualTile.x * TILE, y: actualTile.y * TILE}

    let highlight = 0;
    if (game.isHovered(squareX, squareY)) highlight += 127;
    if (game.isSelected(squareX, squareY)) highlight += 127;
    if (highlight > 0)renderBuffer(ctx, highlightBuffer(buffer, highlight), pos.x, pos.y)
    else renderBuffer(ctx, buffer, pos.x, pos.y)
}

function drawDraggedPiece(ctx, game, squareX, squareY, mouse){
    const buffer = assetBuffers.get(game.board[squareY][squareX].getAssetString());
    const pos = {x: mouse.world.x - 16, y: mouse.world.y-16}
    renderBuffer(ctx, highlightBuffer(buffer, 255), pos.x, pos.y)
}

function highlightBuffer(buffer, amount){  
  const newBuffer = []
  for (let y = 0; y < buffer.length; y++){
    newBuffer[y] = [];
    for (let x = 0; x < buffer[y].length; x++){
      if (buffer[y][x][0] + buffer[y][x][1] + buffer[y][x][2] === 0 && buffer[y][x][3] === 1){
        newBuffer[y][x] = [amount, amount , amount, 1];
      } else {
        newBuffer[y][x] = buffer[y][x];
      }
    }
  }
  return newBuffer
}

export function drawPlayers(ctx, game, mouse){
  const hand = assetBuffers.get("hand")
  const flippedHand = assetBuffers.get("flippedHand")
  renderBuffer(ctx, hand, mouse.world.x - 16 , mouse.world.y - 16)
  if (game.you.active) renderBuffer(ctx, flippedHand, game.you.x - 16 , game.you.y - 16)
}

function flipBuffer(buffer){
  const newBuffer = []
  for (let y = 0; y < buffer.length; y++){
    newBuffer[y] = [];
    for (let x = 0; x < buffer[y].length; x++){
      newBuffer[buffer.length - 1 - y][buffer[y].length - 1 - x] = buffer[y][x]
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
    if(!b)return;
    forEachPixel(b, (x, y) =>{
        ctx.fillStyle = `rgba(${b[y][x][0]},${b[y][x][1]},${b[y][x][2]},${b[y][x][3]})`;
        ctx.fillRect(xPos + x , yPos + y, 1, 1);
    })
}

export function drawMoveDots(ctx, game) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

    for (const m of game.validMoves) {
      const actualTile = game.boardOrientation === 1 ? {x: m.to.x, y: m.to.y} : {x: 7-m.to.x, y: 7-m.to.y}
      ctx.beginPath();
      ctx.fillRect(
        actualTile.x * TILE + TILE/2 - MOVEDOT/2,
        actualTile.y * TILE + TILE/2 - MOVEDOT/2,
        8,
        8
      );
      ctx.fill();
    }
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