import Game from './game.js';
import P2P from './net/p2p.js';
import {loadBuffers, drawBoard, drawPieces, drawMoveDots, drawPlayers, drawMenu, drawClock, menuAssetsLoaded } from './render.js';
import {setupInput} from './input.js';
import Display from './display.js';
import Mouse from './mouse.js';
import Player from './player.js';
import Action from './net/action.js';
import Page from './page.js';
import Menu from './ui/Menu.js';
import Clock from './ui/Clock.js';
import AnimationManager from './animation/animationManager.js';
import MoveAnimation from './animation/moveAnimation.js';
import MenuAnimation from './animation/MenuAnimation.js';
import {playTitleSound} from './audio.js'

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
const game = new Game("main", startingPosition, new Player(0, 0, true), new Player(0, 0, false));
const animations = new AnimationManager();

function setPageTo(state){
  page.setState(state) ;
}

async function initBuffers(){
  await loadBuffers();
  setPageTo("awaitingClick")
}

initBuffers();

export function beginTitleSequence(){
    animations.add(new MenuAnimation(menu, time, setPageTo))   
    playTitleSound();
}

game.onMove = event => {
    animations.add(
        new MoveAnimation(
            time, 
            event.theMove,
            game.currentDrag,
            game.boardOrientation
        )
    );
};

game.onGameEnd = () => {
  page.setState("menu") 
}
const clock = new Clock({
    setTimer(mouse){
      clock.setTimeControl(mouse)
    }
});

const p2p = new P2P(game, clock);

const menu = new Menu({

    playOffline() {
      console.log("play offline")
      page.setState("game");
    },

    hostRoom(name) {
      p2p.host(name);
      game.setP2P(p2p)
      clock.setP2P(p2p)
      game.setPlayerColors(game.me, ["white"])
      game.setPlayerColors(game.you, ["black"])
      game.handShake = false;
      page.setState("game");
    },

    joinRoom(name) {
      p2p.join(name)
      game.setP2P(p2p)
      clock.setP2P(p2p)
      game.setPlayerColors(game.me, ["black"])
      game.setPlayerColors(game.you, ["white"])
      game.boardOrientation *= -1;
      page.setState("game");
    }

});

setupInput(mouse, menu, clock, game, page);
loop();

function loop() {

  if (game.you.active){
    if (time % game.me.refreshTime === 0) p2p.send(new Action("hand", mouse));
    game.you.update();
    game.me.updateLocal(mouse);
    game.checkForHandShake();
  }
  
  switch(page.state){
    case "menu":
      drawMenu(ctx, menu);
      break;
    case "game":
      
      overlayCtx.clearRect(-display.xOff, -display.yOff, overlay.width, overlay.height);
      clock.update(performance.now())
      drawClock(clock, overlayCtx);
      drawBoard(ctx);
      drawPieces(ctx, game, animations, mouse);
      drawMoveDots(ctx, game);
      drawPlayers(overlayCtx, game, mouse);
      break;
  }

  time++;
  animations.update(time);
  animations.draw(ctx);
  
  requestAnimationFrame(loop);
}