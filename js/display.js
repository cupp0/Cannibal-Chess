class Display {
    constructor(canvas, ctx) {
        this.baseSize = 256;
        this.calculate(canvas, ctx);
    }

    calculate(canvas, ctx) {
        const minDim = Math.min(window.innerWidth, window.innerHeight);
        this.multiplier = Math.floor(minDim / this.baseSize);
        this.finalSize = this.baseSize * this.multiplier;

        canvas.width = this.finalSize;
        canvas.height = this.finalSize;
        ctx.setTransform(this.multiplier, 0, 0, this.multiplier, 0, 0);
    }
}

export default Display;