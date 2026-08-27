import Game from './game.js';
import P2P from './net/p2p.js';
import {initBuffers, drawGame, drawMenu} from './render.js';
import {setupInput} from './input.js';
import Display from './display.js';
import Mouse from './mouse.js';
import Player from './player.js';
import Page from './page.js';
import Menu from './ui/Menu.js';
import Clock from './ui/Clock.js';
import AnimationManager from './animation/animationManager.js';

let time = 0;
const bgCanvas = document.getElementById("background");
const bgCtx = bgCanvas.getContext("2d");
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayCtx = overlay.getContext("2d");

const background = new Image();
background.src = './assets/sprites/parkBench.png'

const display = new Display(canvas, ctx, bgCanvas, bgCtx, overlay, overlayCtx);
const mouse = new Mouse(display);
function renderBackground(){
  const benchDims = background.width*display.multiplier
  const diff = {x: bgCanvas.width - benchDims, y: bgCanvas.height - benchDims}
  bgCtx.drawImage(background, diff.x/2, diff.y/2, background.width*display.multiplier, background.height*display.multiplier)
}
const page = new Page("pageLoad", renderBackground)
const startingPosition = "r,n,b,q,k,b,n,r/p,p,p,p,p,p,p,p/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/P,P,P,P,P,P,P,P/R,N,B,Q,K,B,N,R white KQkq -"
const animations = new AnimationManager(page);
const game = new Game("main", startingPosition, new Player(0, 0, true), new Player(0, 0, false), animations);
const clock = new Clock(); clock.initUI(); 
const p2p = new P2P(game, clock);
const menu = new Menu(p2p, game, clock, page); menu.initUI();

initBuffers(page);
setupInput(mouse, menu, clock, game, page, animations, time);

const targetFps = 20; 
const frameInterval = 1000 / targetFps; 
let lastFrameTime = 0;

loop();
function loop() {
    // console.log("me: " + game.me.pos.x + ", " + game.me.pos.y)
    // console.log("you: " + game.you.pos.x + ", " + game.you.pos.y)
    requestAnimationFrame(loop);

    //limit fps
    clock.update(performance.now())
    const elapsed = performance.now() - lastFrameTime;
    if (elapsed < frameInterval) return;
    lastFrameTime = performance.now() - (elapsed % frameInterval);

    //send cursor position to peer
    if (game.you.active)game.updatePeer(mouse)
  
    animations.update(time);

    //render
    switch(page.state){
      case "menu":
        drawMenu(ctx, menu);
        break;
      case "game":
        drawGame(ctx, overlayCtx, game, animations, mouse, display, overlay, clock)
        break;
    }

    animations.draw(ctx);
    
    time++;
}

export function getTime(){
  return time
}