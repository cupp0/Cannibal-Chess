import Game from './game.js';
import P2P from './net/p2p.js';
import {initBuffers, drawGame, drawMenu, getBuffer, renderBuffer} from './render.js';
import {createMainMenu, createEndMenu} from './ui/createMenus.js';
import {setupInput} from './input.js';
import Display from './display.js';
import Mouse from './mouse.js';
import Player from './player.js';
import Page from './page.js';
import Clock from './ui/Clock.js';
import AnimationManager from './animation/animationManager.js';
import MenuAnimation from './animation/MenuAnimation.js';
import MessageAnimation from './animation/messageAnimation.js';
import Action from './net/action.js';
import {playSound} from './audio.js'

let time = 0;
const bgCanvas = document.getElementById("background");
const bgCtx = bgCanvas.getContext("2d");
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayCtx = overlay.getContext("2d");
overlayCtx.font = "8px RetroFont";

// const background = new Image();
// background.src = './assets/sprites/bench.png'

const display = new Display(canvas, ctx, bgCanvas, bgCtx, overlay, overlayCtx);
const mouse = new Mouse(display);
function renderBackground(){
  const b = getBuffer("bench")
  // const benchDims = {x: background.width*display.multiplier, y: background.height*display.multiplier}
  // const diff = {x: bgCanvas.width - benchDims.x, y: bgCanvas.height - benchDims.y}
  renderBuffer(bgCtx, b, -383, -128)
}
const page = new Page("pageLoad", renderBackground, beginTitleSequence, ctx)
const startingPosition = "r,n,b,q,k,b,n,r/p,p,p,p,p,p,p,p/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/P,P,P,P,P,P,P,P/R,N,B,Q,K,B,N,R white KQkq -"
const animations = new AnimationManager(page);
const game = new Game("main", startingPosition, new Player(0, 0, true), new Player(0, 0, false), animations, onGameEnd);
const clock = new Clock(); clock.initUI(); 
const p2p = new P2P(game, clock);
const mainMenu = createMainMenu(p2p, game, clock, page);
const endMenu = createEndMenu(p2p, game, clock, page);

initBuffers(page, ctx);
setupInput(mouse, mainMenu, endMenu, clock, game, page);

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
  
    animations.update(time);
    if (page.state !== "game" && page.state !== "menu")animations.draw(overlayCtx);

    //render
    switch(page.state){
      case "menu":
        drawMenu(overlayCtx, mainMenu);
        animations.draw(overlayCtx);
        break;
      case "game":
        drawGame(ctx, overlayCtx, game, animations, mouse, display, overlay, clock)
        break;
      case "endGameDialog":
        drawMenu(overlayCtx, endMenu)
        break;  
    }

    time++;
}

export function getTime(){
  return time
}

function beginTitleSequence(){  
    page.setState("menuAnimation")
    animations.add(new MenuAnimation(mainMenu, time))   
    playSound("title");
}

function onGameEnd(result){
    endMenu.bodyName = result
    page.setState("endGameDialog")
}

export function setPageState(state){
  page.setState(state)
}

window.chat = (theChat) => {
  createChat(theChat, true)
}

export function createChat(theChat, isLocal){
  if (page.state !== "game") return;
  animations.add(new MessageAnimation(time, theChat, 200, true, 5-(display.xOff / display.multiplier)))
  playSound("pop");
  if (game.you.active && isLocal){
    console.log("sending chat")
     p2p.send(new Action("chat", theChat))
  }
}