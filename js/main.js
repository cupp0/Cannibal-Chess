import Game from './game.js';
import P2P from './net/p2p.js';
import {loadBuffers, drawGame, drawMenu} from './render.js';
import {setupInput} from './input.js';
import Display from './display.js';
import Mouse from './mouse.js';
import Player from './player.js';
import Page from './page.js';
import Menu from './ui/Menu.js';
import Clock from './ui/Clock.js';
import AnimationManager from './animation/animationManager.js';
import MenuAnimation from './animation/MenuAnimation.js';
import MenuRingAnimation from './animation/MenuRingAnimation.js';
import {playSound, pauseSound} from './audio.js'

let time = 0;
const bgCanvas = document.getElementById("background");
const bgCtx = bgCanvas.getContext("2d");
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayCtx = overlay.getContext("2d");

const display = new Display(canvas, ctx, bgCanvas, bgCtx, overlay, overlayCtx);
const mouse = new Mouse(display);
const page = new Page("pageLoad")
const startingPosition = "r,n,b,q,k,b,n,r/p,p,p,p,p,p,p,p/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/P,P,P,P,P,P,P,P/R,N,B,Q,K,B,N,R white KQkq -"
const animations = new AnimationManager();
const game = new Game("main", startingPosition, new Player(0, 0, true), new Player(0, 0, false), animations, time);
const clock = new Clock(); clock.initUI(); 
const p2p = new P2P(game, clock);
const menu = new Menu(p2p, game, clock, page); menu.initUI();

initBuffers();
setupInput(mouse, menu, clock, game, page);

const targetFps = 20; 
const frameInterval = 1000 / targetFps; 
let lastFrameTime = 0;

loop();
function loop() {

    requestAnimationFrame(loop);

    //limit fps
    clock.update(performance.now())
    const elapsed = performance.now() - lastFrameTime;
    if (elapsed < frameInterval) return;
    lastFrameTime = performance.now() - (elapsed % frameInterval);

    //send cursor position to peer
    if (game.you.active)game.updatePeer(mouse)
  
    //render
    switch(page.state){
      case "menu":
        drawMenu(ctx, menu);
        break;
      case "game":
        drawGame(ctx, overlayCtx, game, animations, mouse, display, overlay, clock)
        break;
    }

  animations.update(time);
  animations.draw(ctx);
  time++;
}

function menuRing(freezeFrame){
  page.setState("menu")
  animations.add(new MenuRingAnimation(freezeFrame, time)) 
  pauseSound("title");
  playSound("ring")
}

async function initBuffers(){
  await loadBuffers();
  page.setState("awaitingClick")
}

export function beginTitleSequence(){
    animations.add(new MenuAnimation(menu, time, menuRing))   
    playSound("title");
}