import MoveAnimation from './moveAnimation.js';
import CannibalAnimation from './cannibalAnimation.js';
import CaptureAnimation from './captureAnimation.js';

export default class AnimationManager {

    constructor() {
        this.animations = [];
    }

    isSquareAnimated(x, y){
        for (const a of this.animations){
            const from = a.move.from;
            const to = a.move.to;
            if (from.x === x && from.y === y) return true;
            if (to.x === x && to.y === y) return true;
        }
        return false;
    }

    add(animation) {
        this.animations.push(animation);
    }

    update(dt) {
        this.animations.forEach(a => a.update(dt));

        for (const a of this.animations){
            if (a.finished)this.onAnimationEnd(a)
        }

        this.animations =
            this.animations.filter(a => !a.finished);
    }

    draw(ctx) {
        this.animations.forEach(a => a.draw(ctx));
    }

    onAnimationEnd(a){
        if (a instanceof MoveAnimation){
            if (a.move.type === "cannibal"){
                this.add(new CannibalAnimation(a.currentTime, a.move))
            }
            if (a.move.type === "capture"){
                this.add(new CaptureAnimation(a.currentTime, a.move))
            }
        }
    }
}