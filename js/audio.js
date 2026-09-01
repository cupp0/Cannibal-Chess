const sounds = new Map();

sounds.set("move", new Audio("assets/sound/synthMove.wav"))
sounds.set("capture", new Audio("assets/sound/synthCapture.wav"));
sounds.set("cannibal", new Audio("assets/sound/synthCannibal.wav"));
sounds.set("title", new Audio("assets/sound/titleSound.wav"));
sounds.set("ring", new Audio("assets/sound/ring.wav"));
sounds.set("pop", new Audio("assets/sound/pop.wav"));
sounds.set("stomp", new Audio("assets/sound/stomp.wav"));
sounds.set("roar", new Audio("assets/sound/roar.wav"));

export function playSound(sound){
  sounds.get(sound).currentTime = 0;
  sounds.get(sound).play()
}

export function pauseSound(sound) {
    const audio = sounds.get(sound)
    const originalVolume = audio.volume;
    const duration = 500;
    const startTime = performance.now();

    function fade() {
        const progress = Math.min(
            (performance.now() - startTime) / duration,
            1
        );

        audio.volume = originalVolume * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(fade);
        } else {
            audio.pause();
            audio.volume = originalVolume;
        }
    }

    fade();
}
