'use strict';

export function createPlayer (timeline, scrollTarget) {
    const duration = timeline.duration || 1;
    const frames = [];
    let raf;

    function onScroll () {
        const time = scrollTarget.pageYOffset;

        let frame = frames[time]

        if (!frame) {
            const t = (time >= duration) ? duration : time;
            frame = frames[time] = timeline(t / duration);
        }

        window.requestAnimationFrame(frame);
    }

    onScroll();
    scrollTarget.addEventListener('scroll', onScroll);


    return {
        stop: function () {
            scrollTarget.removeEventListener('scroll', onScroll);
        }

    }

}
