const sounds = new Map();

sounds.set("move", new Audio("assets/sound/synthMove.wav"))
sounds.set("capture", new Audio("assets/sound/synthCapture.wav"));
sounds.set("cannibal", new Audio("assets/sound/synthCannibal.wav"));
sounds.set("title", new Audio("assets/sound/titleSound.wav"));
sounds.set("ring", new Audio("assets/sound/ring.wav"));

export function playSound(sound){
  sounds.get(sound).currentTime = 0;
  sounds.get(sound).play()
}

export function pauseSound(sound){
  sounds.get(sound).pause();
  sounds.get(sound).currentTime = 0;
}