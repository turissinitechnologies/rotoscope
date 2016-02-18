'use strict';

import rafThrottle from './throttle/onRequestAnimationFrame';
import { createScrollClock } from './ScrollClock';

export function createPlayer (timeline, clock = createScrollClock(window)) {
    let currentTime = 0;
    let isDrawing = false;
    const duration = timeline.duration || 1;

    function pause () {
        clock.unlisten(throttledClockUpdate);
    }

    function onClockUpdate (time) {
        if (isDrawing) {
            return;
        }
        isDrawing = true;
        let t = time + currentTime;

        if (t >= duration) {
            t = duration;
        }

        const draw = timeline(t / duration)

        window.requestAnimationFrame(function () {
            draw();
            currentTime = t;
            isDrawing = false;
        });
    }

    clock.listen(onClockUpdate);

    return {
        get currentTime () {
            return currentTime;
        },

        set currentTime (time) {
            onClockUpdate(time);
        },

        get duration () {
            return timeline.duration;
        },

        get paused () {
            return clock.isPaused();
        }

    }

}
