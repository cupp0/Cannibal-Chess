import Piece from './pieces/Piece.js';

const TILE = 32;
const MOVEDOT = 8;
const assetBuffers = new Map()

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
        ctx.fillStyle = (x + y) % 2 === 0 ? "rgba(110, 118, 130, 255)" : "rgba(58, 47, 54, 255)";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    ctx.strokeStyle = 'black'; // Accepts hex, rgb, rgba, hsl, or named colors
    ctx.lineWidth = 1;           // Set line thickness in pixels

    for (let x = 0; x < 8; x++) {
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

export function drawPieces(ctx, game){
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (!game.board[y][x])continue;
            drawPiece(game, x, y, ctx);
          }
    }
}

function drawPiece(game, squareX, squareY, ctx){
    const label = game.board[squareY][squareX].label;
    const col = label === label.toLowerCase() ? "black" : "white";
    const name = col+"-"+(label.toLowerCase())
    const buffer = assetBuffers.get(name)
    const actualTile = game.boardOrientation === 1 ? {x: squareX, y: squareY} : {x: 7-squareX, y: 7-squareY}
    if(!buffer)return;
    for (let y = 0; y < buffer.length; y++) {
      for (let x = 0; x < buffer[y].length; x++) {
        const fill = {r: buffer[y][x][0], g: buffer[y][x][1], b: buffer[y][x][2], a: buffer[y][x][3]}        
        //hover makes outline grey
        if (game.hovered && game.hovered.x === squareX && game.hovered.y === squareY && fill.r + fill.g + fill.b === 0){
          fill.r = 127; fill.g = 127; fill.b = 127;
        }
        //selected makes outline white
        if (game.selected && game.selected.x === squareX && game.selected.y === squareY && buffer[y][x][0] + buffer[y][x][1] + buffer[y][x][2] === 0){
          fill.r = 255; fill.g = 255; fill.b = 255;
        }
        ctx.fillStyle = `rgba(${fill.r},${fill.g},${fill.b},${fill.a})`;
        ctx.fillRect(actualTile.x * TILE + x, actualTile.y * TILE + y, 1, 1);
      }
    } 
}

export function drawPlayers(ctx, mouse){
  const hand = assetBuffers.get("hand")
    if(!hand)return;
    for (let y = 0; y < hand.length; y++) {
      for (let x = 0; x < hand[y].length; x++) {
        const fill = {r: hand[y][x][0], g: hand[y][x][1], b: hand[y][x][2], a: hand[y][x][3]}        
        ctx.fillStyle = `rgba(${fill.r},${fill.g},${fill.b},${fill.a})`;
        ctx.fillRect(mouse.world.x + x-16 , mouse.world.y + y-8 , 1, 1);
      }
    } 
}

function renderBuffer(ctx, buffer, xPos, yPos){
    if(!buffer)return;
    for (let y = 0; y < buffer.length; y++) {
        for (let x = 0; x < buffer[y].length; x++) {
          const fill = {r: buffer[y][x][0], g: buffer[y][x][1], b: buffer[y][x][2], a: buffer[y][x][3]}        
          ctx.fillStyle = `rgba(${fill.r},${fill.g},${fill.b},${fill.a})`;
          ctx.fillRect(xPos + x , yPos + y, 1, 1);
        }
    } 
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