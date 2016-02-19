require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createPlayer = createPlayer;

var _onRequestAnimationFrame = require('./throttle/onRequestAnimationFrame');

var _onRequestAnimationFrame2 = _interopRequireDefault(_onRequestAnimationFrame);

var _ScrollClock = require('./ScrollClock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPlayer(timeline) {
    var clock = arguments.length <= 1 || arguments[1] === undefined ? (0, _ScrollClock.createScrollClock)(window) : arguments[1];

    var currentTime = 0;
    var isDrawing = false;
    var duration = timeline.duration || 1;

    function pause() {
        clock.unlisten(throttledClockUpdate);
    }

    function onClockUpdate(time) {
        if (isDrawing) {
            return;
        }
        isDrawing = true;
        var t = time + currentTime;

        if (t >= duration) {
            t = duration;
        }

        var draw = timeline(t / duration);

        window.requestAnimationFrame(function () {
            draw();
            currentTime = t;
            isDrawing = false;
        });
    }

    clock.listen(onClockUpdate);

    return {
        get currentTime() {
            return currentTime;
        },

        set currentTime(time) {
            onClockUpdate(time);
        },

        get duration() {
            return timeline.duration;
        },

        get paused() {
            return clock.isPaused();
        }

    };
}

},{"./ScrollClock":2,"./throttle/onRequestAnimationFrame":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createScrollClock = createScrollClock;

var _onRequestAnimationFrame = require('./throttle/onRequestAnimationFrame');

var _onRequestAnimationFrame2 = _interopRequireDefault(_onRequestAnimationFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createScrollClock(scrollTarget) {
    var handlers = [];
    var scrollPos = 0;

    function onScroll() {
        var scrollY = scrollTarget.scrollY;
        if (typeof scrollPos === 'number') {
            var scroll = scrollY - scrollPos;
            fireHandlers(scroll);
        }

        scrollPos = scrollY;
    }

    function fireHandlers(scrollY) {
        handlers.forEach(function (handler) {
            handler(scrollY);
        });
    }

    var throttled = onScroll;

    return {

        unlisten: function unlisten(handler) {
            var index = handlers.indexOf(handler);
            handlers.splice(index, 1);

            if (handlers.length === 0) {
                scrollTarget.removeEventListener('scroll', throttled);
            }
        },

        listen: function listen(handler) {
            handlers.push(handler);
            onScroll();
            scrollTarget.addEventListener('scroll', throttled);
        }

    };
};

},{"./throttle/onRequestAnimationFrame":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTimeline = createTimeline;
function createTimeline() {
    var clips = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];


    function getClipsAtTime(timelineTime) {
        return clips.filter(function (clip) {
            var fill = clip.fill;
            var start = clip.offset;
            var end = start + clip.duration;

            if (fill === 'none' && timelineTime >= start && timelineTime <= end) {
                return clip;
            } else if (fill === 'backwards' && timelineTime <= end) {
                return clip;
            } else if (fill === 'forwards' && timelineTime >= start) {
                return clip;
            } else if (fill === 'both') {
                return clip;
            }
        });
    };

    var drawFunctions = [];

    var timeline = function timeline(time) {
        var duration = timeline.duration;
        var timelineTime = duration * time;
        var clips = getClipsAtTime(timelineTime);

        var drawFunctions = clips.map(function (clip) {
            var offset = clip.offset;
            var fill = clip.fill;
            var duration = clip.duration;
            var end = duration + offset;
            var clipTime = timelineTime - offset;

            if ((fill === 'backwards' || fill === 'both') && timelineTime < offset) {
                clipTime = 0;
            } else if ((fill === 'forwards' || fill === 'both') && timelineTime > end) {
                clipTime = duration;
            }

            var clipPercent = clipTime / duration;
            return clip.clip(clipPercent);
        });

        return function () {
            drawFunctions.forEach(function (h) {
                if (typeof h === 'function') {
                    h();
                }
            });
        };
    };

    timeline.chainChild = function (child, clip) {
        var relativeBounds = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var childBounds = clips.filter(function (clip) {
            return clip.clip === child;
        })[0];

        var relativeOffset = typeof relativeBounds.offset === 'number' ? relativeBounds.offset : 0;

        var offset = childBounds.offset + childBounds.duration + relativeOffset;

        var bounds = Object.assign(relativeBounds, {
            offset: offset
        });

        return this.appendChild(clip, bounds);
    };

    timeline.appendChild = function (clip, _ref) {
        var _ref$offset = _ref.offset;
        var offset = _ref$offset === undefined ? 0 : _ref$offset;
        var _ref$fill = _ref.fill;
        var fill = _ref$fill === undefined ? 'both' : _ref$fill;
        var duration = _ref.duration;

        var clipDuration = 1;

        if (typeof duration === 'number') {
            clipDuration = duration;
        } else if (typeof clip.duration === 'number') {
            clipDuration = clip.duration;
        }

        var timeBounds = {
            offset: offset,
            fill: fill,
            duration: clipDuration
        };

        var clipsClone = clips.slice(0);
        clipsClone.push({
            clip: clip,
            offset: offset,
            fill: fill,
            duration: clipDuration
        });

        return createTimeline(clipsClone);
    };

    Object.defineProperty(timeline, 'duration', {
        get: function get() {
            return clips.reduce(function (seed, clip) {
                if (clip.offset + clip.duration > seed) {
                    return clip.offset + clip.duration;
                }

                return seed;
            }, 0);
        }
    });

    return timeline;
};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (handler) {
    var raf = undefined;

    return function () {
        var throttleArgs = arguments;
        if (!raf) {
            raf = window.requestAnimationFrame(function (time) {
                handler.apply(undefined, _toConsumableArray(throttleArgs));
                raf = null;
            });
        }
    };
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

;

},{}],"rotoscope":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTimeline = undefined;
exports.createRotoscope = createRotoscope;

var _Player = require('./Player');

var _ScrollClock = require('./ScrollClock');

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
        play: function play() {
            var clock = (0, _ScrollClock.createScrollClock)(scrollTarget);
            var playerTimelineBounds = Object.assign(bounds, {
                fill: 'both'
            });

            var playerTimeline = (0, _Timeline.createTimeline)().appendChild(scrollTarget, playerTimelineBounds);

            return (0, _Player.createPlayer)(timeline, clock);
        }
    };
};

function createRotoscope(scrollElement) {
    return createParallax(scrollElement);
};

exports.createTimeline = _Timeline.createTimeline;

},{"./Player":1,"./ScrollClock":2,"./Timeline":3}]},{},[]);
