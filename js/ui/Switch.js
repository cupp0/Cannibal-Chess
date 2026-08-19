export default class Switch {
    constructor(name, color, x, y, w, h) {
        this.name = name  
        this.color = color 
        this.x = x;
        this.y = y;
        this.w = w
        this.h = h; 
        this.hover = false;
    }

    setCallback(cb){
        this.onClick = cb
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
        this.hover = this.contains(mouse.world.x, mouse.world.y)
    }

    onMouseDown(mouse) {
        if (this.hover) this.onClick(this.color)
    }

    onMouseUp(mouse){}

    draw(ctx) {}

}