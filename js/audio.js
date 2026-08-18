let moveSound = new Audio("assets/sound/synthMove.wav");
let captureSound = new Audio("assets/sound/synthCapture.wav");
let cannibalSound = new Audio("assets/sound/synthCannibal.wav");
let titleSound = new Audio("assets/sound/titleSound.wav");

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

export function playTitleSound(){
  titleSound.currentTime = 0;
  titleSound.play();
}