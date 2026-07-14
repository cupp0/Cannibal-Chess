class Display {
    constructor(canvas, ctx, bg, bgctx) {
        this.baseSize = 256;
        this.calculate(canvas, ctx, bg, bgctx);
    }

    calculate(canvas, ctx, bg, bgctx) {
        const minDim = Math.min(window.innerWidth, window.innerHeight);
        this.multiplier = Math.floor(minDim / this.baseSize);
        this.finalSize = this.baseSize * this.multiplier;
        canvas.width = this.finalSize;
        canvas.height = this.finalSize;

        const x = (window.innerWidth - this.finalSize) / 2;
        const y = (window.innerHeight - this.finalSize) / 2;
        canvas.style.left = `${x}px`;
        canvas.style.top = `${y}px`;
        bg.width = window.innerWidth;
        bg.height = window.innerHeight;
        
        ctx.setTransform(this.multiplier, 0, 0, this.multiplier, 0, 0);
       // bgctx.setTransform(this.multiplier, 0, 0, this.multiplier, 0, 0);
    }
}

export default Display;