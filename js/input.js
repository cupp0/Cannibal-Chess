export function setupInput(mouse, mainMenu, endMenu, clock, game, page){

    window.addEventListener("pointermove", e =>{
        mouse.updateScreenCoords({x:e.clientX, y:e.clientY}, game.me.perspective)
        clock.onMouseMove(mouse);
        switch (page.state){
            case "menu" : mainMenu.onMouseMove(mouse); break;
            case "endGameDialog" : endMenu.onMouseMove(mouse); break;
            case "game" :
            game.me.updateLocal(mouse)
            mouse.updateBoardCoords();
            game.onMouseMove(mouse.board.x, mouse.board.y); break;
        }    
    })

    window.addEventListener("pointerdown", e => {
        mouse.updateScreenCoords({x:e.clientX, y:e.clientY}, game.me.perspective)
        clock.onMouseDown(mouse);
        switch (page.state){
            case "menu" : mainMenu.onMouseDown(mouse); break;
            case "endGameDialog" : endMenu.onMouseDown(mouse); break;
            case "game" : game.onMouseDown(mouse.board.x, mouse.board.y); break;
        }  

        if (page.state === "awaitingClick" || page.state === "pageLoad"){
            page.onClick()
        }
        
    });

    window.addEventListener("pointerup", e => {
        clock.onMouseUp(mouse);
        switch (page.state){
            case "game" : game.onMouseUp(mouse.board.x, mouse.board.y); break;
        }  
    });

    window.addEventListener("keydown", e => {
        switch (page.state){
            case "menu" : mainMenu.onKeyDown(e); break;
            case "game" : game.onKeyDown(e); break;
        }      
    });

}
