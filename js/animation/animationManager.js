import MoveAnimation from './moveAnimation.js';
import CannibalAnimation from './cannibalAnimation.js';
import CaptureAnimation from './captureAnimation.js';
import MenuAnimation from './MenuAnimation.js';
import Move from '../move.js';

export default class AnimationManager {

    constructor() {
        this.animations = [];
    }

    isSquareAnimated(x, y, orientation){
        for (const a of this.animations){
            if (!a.move) continue;
            if (a.move.from.x === x && a.move.from.y === y) return true;
            if (a.move.to.x === x && a.move.to.y === y) return true;
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
                this.add(new CannibalAnimation(a.currentTime, a.move, a.orientation))
            }
            if (a.move.type === "capture"){
                this.add(new CaptureAnimation(a.currentTime, a.move, a.orientation))
            }
        }
        if (a instanceof MenuAnimation){
            a.callback(a.finalFrame);
        }
    }
}