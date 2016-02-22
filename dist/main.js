'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTimeline = undefined;
exports.createRotoscope = createRotoscope;

var _Player = require('./Player');

var _Timeline = require('./Timeline');

function createParallax(scrollTarget) {
    var bounds = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var timeline = arguments[2];

    return {
        startsAt: function startsAt(offsetY) {
            var cloneBounds = Object.assign(bounds, {
                start: offsetY
            });

            return createParallax(scrollTarget, cloneBounds, timeline);
        },
        bounds: function bounds(b) {
            return createParallax(scrollTarget, b, timeline);
        },
        duration: function duration(offsetY) {
            var cloneBounds = Object.assign(bounds, {
                duration: offsetY
            });

            return createParallax(scrollTarget, cloneBounds, timeline);
        },
        animate: function animate(factory) {
            var animateTimeline = factory((0, _Timeline.createTimeline)());

            return createParallax(scrollTarget, bounds, animateTimeline);
        },
        start: function start() {
            var playerTimelineBounds = Object.assign(bounds, {
                fill: 'both'
            });

            var playerTimeline = (0, _Timeline.createTimeline)().appendChild(scrollTarget, playerTimelineBounds);

            return (0, _Player.createPlayer)(timeline, scrollTarget);
        }
    };
};

function createRotoscope(scrollElement) {
    return createParallax(scrollElement);
};

exports.createTimeline = _Timeline.createTimeline;