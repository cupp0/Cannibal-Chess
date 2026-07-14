import Game from './game.js';
import P2P from './net/p2p.js';
import {drawBackground, drawBoard, drawPieces, drawMoveDots, drawPlayers, drawMenu } from './render.js';
import {setupInput} from './input.js';
import Display from './display.js';
import Mouse from './mouse.js';
import Page from './page.js'
import Menu from './ui/Menu.js'
import AnimationManager from './animation/animationManager.js';
import MoveAnimation from './animation/moveAnimation.js';

let time = 0;
const bgCanvas = document.getElementById("background");
const bgCtx = bgCanvas.getContext("2d");
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const display = new Display(canvas, ctx, bgCanvas, bgCtx);
const mouse = new Mouse(display);
const page = new Page("menu")
const startingPosition = "r,n,b,q,k,b,n,r/p,p,p,p,p,p,p,p/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/P,P,P,P,P,P,P,P/R,N,B,Q,K,B,N,R white KQkq -"
const game = new Game("main", startingPosition);
const animations = new AnimationManager();

game.onMove = event => {
    animations.add(
        new MoveAnimation(
            time, 
            event.theMove,
            game.dragging,
            game.boardOrientation
        )
    );

};

game.onGameEnd = () => {
  page.setState("menu") 
}

const p2p = new P2P(game);
const menu = new Menu({

    playOffline() {
      console.log("play offline")
      page.setState("game");
    },

    hostRoom(name) {
      p2p.host(name);
      game.setP2P(p2p)
      page.setState("game");
    },

    joinRoom(name) {
      p2p.join(name)
      game.setP2P(p2p)
      page.setState("game");
    }

});

setupInput(canvas, mouse, menu, game, page);
loop();

function loop() {
  drawBackground(bgCtx);
  drawBoard(ctx);
  animations.update(time);
  animations.draw(ctx);
  
  switch(page.state){
    case "menu":
      drawMenu(ctx, menu)
      break;
    case "game":
      drawPieces(ctx, game, animations, mouse);
      drawMoveDots(ctx, game);
      drawPlayers(ctx, mouse);
      break;
  }
  
  time++;
  requestAnimationFrame(loop);
}