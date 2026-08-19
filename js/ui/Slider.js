export default class Slider {
    constructor(name, x, y, w, h) {
        this.name = name   
        this.x = x;
        this.y = y;
        this.w = w
        this.h = h; 

        this.held = false;
        this.hover = false;
    }

    setCallback(cb){
        this.onDrag = cb
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