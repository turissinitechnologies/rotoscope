require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createPlayer = createPlayer;

var _onRequestAnimationFrame = require('./throttle/onRequestAnimationFrame');

var _onRequestAnimationFrame2 = _interopRequireDefault(_onRequestAnimationFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPlayer(clock, timeline) {
    var currentTime = 0;

    var throttledClockUpdate = (0, _onRequestAnimationFrame2.default)(onClockUpdate);

    function pause() {
        clock.unlisten(throttledClockUpdate);
    }

    function cycle(time) {
        var duration = timeline.duration || 1;

        if (time >= duration) {
            time = duration;
        }

        var timelineTime = time / duration;

        var timelineDraw = timeline(timelineTime);

        requestAnimationFrame(function () {
            timelineDraw();
            currentTime = time;
        });
    }

    function onClockUpdate(time) {
        cycle(time + currentTime);
    }

    return {
        get currentTime() {
            return currentTime;
        },

        set currentTime(time) {
            cycle(time);
        },

        get duration() {
            return timeline.duration;
        },

        get paused() {
            return clock.isPaused();
        },

        pause: pause,

        play: function play() {
            clock.listen(throttledClockUpdate);
        }
    };
}

},{"./throttle/onRequestAnimationFrame":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createRafClock = createRafClock;

var _onRequestAnimationFrame = require('./throttle/onRequestAnimationFrame');

var _onRequestAnimationFrame2 = _interopRequireDefault(_onRequestAnimationFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createRafClock() {
    var handlers = [];
    var _isPaused = true;
    var raf = undefined;
    var rafTime = undefined;

    function loop() {
        _isPaused = false;
        raf = window.requestAnimationFrame(function (t) {
            if (rafTime) {
                (function () {
                    var time = t - rafTime;
                    handlers.forEach(function (handler) {
                        handler(time / 1000);
                    });
                })();
            }

            rafTime = t;

            if (_isPaused === false) {
                loop();
            }
        });
    }

    return {
        isPaused: function isPaused() {
            return _isPaused;
        },

        stop: function stop() {
            _isPaused = true;
            rafTime = undefined;
            window.cancelAnimationFrame(raf);
        },

        listen: function listen(handler) {
            handlers.push(handler);
        },

        start: function start() {
            loop();
        }

    };
};

},{"./throttle/onRequestAnimationFrame":5}],3:[function(require,module,exports){
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
    var scrollPos = scrollTarget.scrollY;

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

},{"./throttle/onRequestAnimationFrame":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTimeline = createTimeline;
function createTimeline() {
    var clips = [];

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

    timeline.appendChild = function (clip, _ref) {
        var _ref$offset = _ref.offset;
        var offset = _ref$offset === undefined ? 0 : _ref$offset;
        var _ref$fill = _ref.fill;
        var fill = _ref$fill === undefined ? 'none' : _ref$fill;
        var duration = _ref.duration;

        var clipDuration = 1;

        if (typeof duration === 'number') {
            clipDuration = duration;
        } else if (typeof clip.duration === 'number') {
            clipDuration = clip.duration;
        }

        clips.push({
            clip: clip,
            offset: offset,
            fill: fill,
            duration: clipDuration
        });
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

},{}],5:[function(require,module,exports){
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
exports.createTimeline = exports.createScrollClock = exports.createRafClock = exports.createPlayer = undefined;

var _Player = require('./Player');

var _RafClock = require('./RafClock');

var _ScrollClock = require('./ScrollClock');

var _Timeline = require('./Timeline');

exports.createPlayer = _Player.createPlayer;
exports.createRafClock = _RafClock.createRafClock;
exports.createScrollClock = _ScrollClock.createScrollClock;
exports.createTimeline = _Timeline.createTimeline;

},{"./Player":1,"./RafClock":2,"./ScrollClock":3,"./Timeline":4}]},{},[]);
