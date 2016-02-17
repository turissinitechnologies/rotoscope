'use strict';

import rafThrottle from './throttle/onRequestAnimationFrame';

export function createRafClock () {
    const handlers = [];
    let isPaused = true;
    let raf;
    let rafTime;

    function loop () {
        isPaused = false;
        raf = window.requestAnimationFrame(function (t) {
            if (rafTime) {
                const time = (t - rafTime);
                handlers.forEach(function (handler) {
                    handler(time / 1000);
                });
            }

            rafTime = t;

            if (isPaused === false) {
                loop();
            }

        });
    }


    return {
        isPaused: function () {
            return isPaused;
        },

        stop: function () {
            isPaused = true;
            rafTime = undefined;
            window.cancelAnimationFrame(raf);
        },

        listen: function (handler) {
            handlers.push(handler);
        },

        start: function () {
            loop();
        }

    };

};
