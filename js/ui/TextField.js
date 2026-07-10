
export default class TextField {

    constructor(x, y, w, h) {

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.text = "";
        this.focused = false;
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
        this.hover = this.contains(mouse.world.x, mouse.world.y);
    }

    onMouseDown(mouse) {
        if(this.contains(mouse.world.x, mouse.world.y)){
            this.focused = true;
        } else {
            this.focused = false;
        }

    }

    onKeyDown(e) {

        if (!this.focused)
            return;

        if (e.key === "Backspace") {
            this.text = this.text.slice(0, -1);
            return;
        }

        if (e.key.length === 1 && this.text.length < 10) {
            this.text += e.key;
        }
    }

    draw(ctx) {

        ctx.fillStyle = "rgba(51, 41, 47, 255)"
        ctx.fillRect(this.x, this.y, this.w, this.h);

        ctx.strokeStyle = this.focused ? "rgba(160, 160, 160, 255)" : "black";
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.font = '8px "RetroFont"';
        ctx.fillStyle = "rgba(193, 195, 181, 255)";
        ctx.fillText(
            this.text,
            this.x + 4,
            this.y + 9
        );
    }
}