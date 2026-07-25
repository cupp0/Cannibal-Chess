export default class Slider {
    constructor(name, x, y, w, h, onDrag) {
        this.name = name   
        this.x = x;
        this.y = y;
        this.w = w
        this.h = h; 

        //calculate this from display
        //this.bottomPos = {}
        //this.topPos = {}
        this.onDrag = onDrag;
        this.held = false;
        this.hover = false;
    }

    contains(mx, my) {
        return (
            mx >= this.x &&
            mx < this.x + this.w &&
            my >= this.y &&
            my < this.y + this.h
        );
    }

    onMouseMove(mouse) {
        if (this.held){
             this.onDrag(mouse);
             return;
        }
        this.hover = this.contains(mouse.world.x, mouse.world.y)
    }

    onMouseDown(mouse) {
        if (this.hover) this.held = true;
    }

    onMouseUp(mouse){
        this.held = false;
    }

    draw(ctx) {}

}