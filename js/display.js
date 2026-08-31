class Display {
    constructor(canvas, ctx, bg, bgctx, ov, ovCtx) {
        this.baseSize = 256;
        this.calculate(canvas, ctx, bg, bgctx, ov, ovCtx);
    }

    calculate(canvas, ctx, bg, bgctx, ov, ovCtx) {
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
        ov.width = window.innerWidth;
        ov.height = window.innerHeight;

        this.xOff = (ov.width-canvas.width) / 2
        this.yOff = (ov.height-canvas.height) / 2
        //this.overlayOffset = (ov.width - window.innerWidth ) / 2;
        bgctx.setTransform(this.multiplier, 0, 0, this.multiplier, this.xOff, this.yOff);       
        ctx.setTransform(this.multiplier, 0, 0, this.multiplier, 0, 0);
        ovCtx.setTransform(this.multiplier, 0, 0, this.multiplier, this.xOff, this.yOff);
       // bgctx.setTransform(this.multiplier, 0, 0, this.multiplier, 0, 0);
    }

   
}

export default Display;