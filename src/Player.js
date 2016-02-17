'use strict';

import rafThrottle from './throttle/onRequestAnimationFrame';

export function createPlayer (clock, timeline) {
    let currentTime = 0;

    const throttledClockUpdate = rafThrottle(onClockUpdate);

    function pause () {
        clock.unlisten(throttledClockUpdate);
    }

    function cycle (time) {
        const duration = timeline.duration || 1;

        if (time >= duration) {
            time = duration;
        }

        const timelineTime = time / duration;

        const timelineDraw = timeline(timelineTime);

        requestAnimationFrame(function () {
            timelineDraw();
            currentTime = time;
        });
    }

    function onClockUpdate (time) {
        cycle(time + currentTime);
    }

    return {
        get currentTime () {
            return currentTime;
        },

        set currentTime (time) {
            cycle(time);
        },

        get duration () {
            return timeline.duration;
        },

        get paused () {
            return clock.isPaused();
        },

        pause,

        play() {
            clock.listen(throttledClockUpdate);
        }

    }

}
