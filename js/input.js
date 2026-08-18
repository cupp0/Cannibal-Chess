import {beginTitleSequence} from './main.js'

export function setupInput(mouse, menu, clock, game, page){

    window.addEventListener("mousemove", e =>{
        mouse.updateScreenCoords({x:e.clientX, y:e.clientY})
        clock.onMouseMove(mouse);
        switch (page.state){
            case "menu" : menu.onMouseMove(mouse); break;
            case "game" :
            mouse.updateBoardCoords(game);
            game.onMouseMove(mouse.board.x, mouse.board.y); break;
        }    
    })

    window.addEventListener("mousedown", e => {
        clock.onMouseDown(mouse);
        switch (page.state){
            case "menu" : menu.onMouseDown(mouse); break;
            case "game" : game.onMouseDown(mouse.board.x, mouse.board.y); break;
        }  
        
    });

    window.addEventListener("mouseup", e => {
        clock.onMouseUp(mouse);
        switch (page.state){
            case "game" : game.onMouseUp(mouse.board.x, mouse.board.y); break;
        }  
    });

    window.addEventListener("keydown", e => {
        switch (page.state){
            case "menu" : menu.onKeyDown(e); break;
            case "game" : game.onKeyDown(e); break;
        }      
    });

    window.addEventListener("pointerdown", () => {
        if (page.state === "awaitingClick") beginTitleSequence();
    })
}
