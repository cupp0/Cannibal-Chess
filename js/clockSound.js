export default class ClockSound {
    constructor() {
        this.audioCtx = null;
        this.interval = null;
    }

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new AudioContext();
        }
    }

    ring() {
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(2800, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.8);

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
    }

    tick() {
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const buffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.05,
        ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = buffer;

    filter.type = "bandpass";
    filter.frequency.value = 1500;
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    source
        .connect(filter)
        .connect(gain)
        .connect(ctx.destination);

    source.start(now);
}

    async start() {
        this.init();

        // Required if the AudioContext was suspended by the browser
        if (this.audioCtx.state === "suspended") {
            await this.audioCtx.resume();
        }

        if (this.interval !== null)
            return;

        this.tick();

        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    stop() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}