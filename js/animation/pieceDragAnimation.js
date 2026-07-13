import {renderSprite} from '../render.js';

export default class PieceDragAnimation {

    constructor(piece, mouse) {
        this.piece = piece
        this.mouse = mouse
    }

    update(t) {
    }

    draw(ctx) {

        renderSprite(
            ctx,
            this.piece.color+"-"+this.piece.label.toLowerCase(),
            this.mouse.x,
            this.mouse.y
        );
    }
}