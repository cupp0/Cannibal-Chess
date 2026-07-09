import Game from './game.js';
import P2P from './net/p2p.js';
import {drawBoard, drawPieces, drawMoveDots, drawPlayers, drawMenu } from './render.js';
import {setupInput} from './input.js';
import Display from './display.js';
import Mouse from './mouse.js';
import Page from './page.js'
import Menu from './ui/Menu.js'

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const display = new Display(canvas, ctx);
const mouse = new Mouse(display);
const page = new Page("menu")
const startingPosition = "r,n,b,q,k,b,n,r/p,p,p,p,p,p,p,p/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/0,0,0,0,0,0,0,0/P,P,P,P,P,P,P,P/R,N,B,Q,K,B,N,R white KQkq -"
const game = new Game("main", startingPosition);
const p2p = new P2P(game);
const menu = new Menu({

    playOffline() {
      console.log("play offline")
      page.state = "game";
    },

    hostRoom(name) {
      p2p.host(name);
      game.setP2P(p2p)
      page.state = "game"
    },

    joinRoom(name) {
      p2p.join(name)
      game.setP2P(p2p)
      page.state = "game"
    }

});

setupInput(canvas, mouse, menu, game, page);

loop();

function loop() {
  drawBoard(ctx);
  switch(page.state){
    case "menu":
      drawMenu(ctx, menu)
      break;
    case "game":
      drawPieces(ctx, game);
      drawMoveDots(ctx, game);
      drawPlayers(ctx, mouse);
      break;
  }
  
  requestAnimationFrame(loop);
}