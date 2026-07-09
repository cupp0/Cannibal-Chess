export default class Button {
    constructor(name, x, y, w, h, onClick) {
        this.name = name   
        this.x = x;
        this.y = y;
        this.w = w
        this.h = h; 
        this.onClick = onClick;

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
        this.hover = this.contains(mouse.world.x, mouse.world.y)
    }

    onMouseDown(mouse) {
        if (this.hover) this.onClick();
    }

    draw(ctx) {}

}