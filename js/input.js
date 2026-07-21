export function setupInput(canvas, mouse, menu, game, page, background){

    window.addEventListener("mousemove", e =>{
        mouse.updateScreenCoords({x:e.clientX, y:e.clientY})
        switch (page.state){
            case "menu" : menu.onMouseMove(mouse); break;
            case "game" :
            mouse.updateBoardCoords(game);
            game.onMouseMove(mouse.board.x, mouse.board.y); break;
        }    
    })

    window.addEventListener("mousedown", e => {
        switch (page.state){
            case "menu" : menu.onMouseDown(mouse); break;
            case "game" : game.onMouseDown(mouse.board.x, mouse.board.y); break;
        }  
        
    });

    window.addEventListener("mouseup", e => {
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
}
