'use strict';

export function createPlayer (timeline, scrollTarget) {
    const duration = timeline.duration || 1;
    const frames = [];
    let raf;

    window.addEventListener('scroll', function () {
        const time = scrollTarget.pageYOffset;

        let frame = frames[time]

        if (!frame) {
            const t = (time >= duration) ? duration : time;
            frame = frames[time] = timeline(t / duration);
        }

        window.requestAnimationFrame(frame);
    });


    return {}

}
