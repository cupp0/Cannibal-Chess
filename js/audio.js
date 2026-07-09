let moveSound = new Audio("assets/sound/plastic1.wav");
let captureSound = new Audio("assets/sound/plastic2.wav");
let cannibalSound = new Audio("assets/sound/metal2.wav");

export function playMoveSound() {
  moveSound.currentTime = 0;
  moveSound.play();
}

export function playCaptureSound() {
  captureSound.currentTime = 0;
  captureSound.play();
}

export function playCannibalSound(){
  cannibalSound.currentTime = 0;
  cannibalSound.play();
}