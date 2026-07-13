export function setupInput(canvas, mouse, menu, game, page){

    canvas.addEventListener("mousemove", e =>{
        mouse.updateScreenCoords(getCursorPosition(canvas, e))
        switch (page.state){
            case "menu" : menu.onMouseMove(mouse); break;
            case "game" :
            mouse.updateBoardCoords(game);
            game.onMouseMove(mouse.board.x, mouse.board.y); break;
        }    
    })

    canvas.addEventListener("mousedown", e => {
        switch (page.state){
            case "menu" : menu.onMouseDown(mouse); break;
            case "game" : game.onMouseDown(mouse.board.x, mouse.board.y); break;
        }  
        
    });

    canvas.addEventListener("mouseup", e => {
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

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return {x: x, y: y}
}