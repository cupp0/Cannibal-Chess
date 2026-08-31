import {renderSprite} from '../render.js';

export default class MessageAnimation {

    constructor(startTime, message, duration, isLocal, xOff) {
        this.startTime = startTime; 
        this.message = message;
        this.duration = duration;
        this.isLocal = isLocal;
        this.xOff = xOff;
    }

    update(t) {
        this.currentTime = t;
        if (this.currentTime - this.startTime >= this.duration) this.finished = true;
    }

    draw(overlayContext) {
        const ctx = overlayContext;

        const boxWidth = 100;
        const padding = 6;
        const borderWidth = 3;

        ctx.textBaseline = "top";

        // Leave room for padding on both sides.
        const textWidth = boxWidth - padding * 2;

        // Break the message into lines.
        const lines = this.wrapText(ctx, this.message, textWidth);

        // Determine line height from the font.
        const metrics = ctx.measureText("Mg");
        const lineHeight =
            (metrics.actualBoundingBoxAscent +
            metrics.actualBoundingBoxDescent) * 1.25;

        const boxHeight =
            padding * 2 +
            lines.length * lineHeight;

        // Box
        ctx.fillStyle = "rgba(203, 205, 193, 1)";
        ctx.fillRect(this.xOff, (256 - boxHeight ) / 2, boxWidth, boxHeight);

        // Border
        ctx.strokeStyle = "rgba(105, 105, 105, 1)";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(
            this.xOff + borderWidth / 2,
            (256 - boxHeight ) / 2 + borderWidth / 2,
            boxWidth - borderWidth,
            boxHeight - borderWidth
        );

        // Text
        ctx.fillStyle = "black";

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i],
                this.xOff + padding,
                (256 - boxHeight ) / 2 + padding + i * lineHeight
            );
        }

        return {
            width: boxWidth,
            height: boxHeight
        };
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(/\s+/);
        const lines = [];

        let line = "";

        for (const word of words) {
            const testLine = line
                ? line + " " + word
                : word;

            if (ctx.measureText(testLine).width <= maxWidth) {
                line = testLine;
            } else {
                if (line) {
                    lines.push(line);
                }

                // Handle a single word that's wider than the box.
                if (ctx.measureText(word).width > maxWidth) {
                    const chunks = this.breakLongWord(ctx, word, maxWidth);

                    lines.push(...chunks.slice(0, -1));
                    line = chunks[chunks.length - 1];
                } else {
                    line = word;
                }
            }
        }

        if (line) {
            lines.push(line);
        }

        return lines;
    }

    breakLongWord(ctx, word, maxWidth) {
        const chunks = [];
        let chunk = "";

        for (const char of word) {
            const test = chunk + char;

            if (ctx.measureText(test).width <= maxWidth) {
                chunk = test;
            } else {
                if (chunk) {
                    chunks.push(chunk);
                }

                chunk = char;
            }
        }

        if (chunk) {
            chunks.push(chunk);
        }

        return chunks;
    }
  
}