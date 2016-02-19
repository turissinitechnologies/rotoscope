'use strict';

import { createPlayer } from './Player';
import { createScrollClock } from './ScrollClock';
import { createTimeline } from './Timeline';


function createParallax (scrollTarget, bounds = {}, timeline) {
    return {
        startsAt (offsetY) {
            const cloneBounds = Object.assign(bounds, {
                start: offsetY
            });

            return createParallax(scrollTarget, cloneBounds, timeline);
        },

        bounds (b) {
            return createParallax(scrollTarget, b, timeline);
        },

        duration (offsetY) {
            const cloneBounds = Object.assign(bounds, {
                duration: offsetY
            });

            return createParallax(scrollTarget, cloneBounds, timeline);
        },

        animate (factory) {
            const animateTimeline = factory(createTimeline());

            return createParallax(scrollTarget, bounds, animateTimeline);

        },

        start () {
            const clock = createScrollClock(scrollTarget);
            const playerTimelineBounds = Object.assign(bounds, {
                fill: 'both'
            });

            const playerTimeline = createTimeline().appendChild(scrollTarget, playerTimelineBounds);

            return createPlayer(timeline, clock);
        }

    }
};




export function createRotoscope (scrollElement) {
    return createParallax(scrollElement);
};

export {
    createTimeline
};
