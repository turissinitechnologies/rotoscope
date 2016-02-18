'use strict';

import rafThrottle from './throttle/onRequestAnimationFrame';

export function createScrollClock (scrollTarget) {
    const handlers = [];
    let scrollPos = 0;

    function onScroll () {
        const scrollY = scrollTarget.scrollY;
        if (typeof scrollPos === 'number') {
            const scroll = (scrollY - scrollPos);
            fireHandlers(scroll);
        }

        scrollPos = scrollY;
    }

    function fireHandlers (scrollY) {
        handlers.forEach(function (handler) {
            handler(scrollY);
        });
    }

    const throttled = onScroll;


    return {

        unlisten: function (handler) {
            const index = handlers.indexOf(handler);
            handlers.splice(index, 1);

            if (handlers.length === 0) {
                scrollTarget.removeEventListener('scroll', throttled);
            }
        },

        listen: function (handler) {
            handlers.push(handler);
            onScroll();
            scrollTarget.addEventListener('scroll', throttled);
        }

    };

};
