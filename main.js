require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createPlayer = createPlayer;
function createPlayer(timeline, scrollTarget) {
    var duration = timeline.duration || 1;
    var frames = [];
    var raf = undefined;

    function onScroll() {
        var time = scrollTarget.pageYOffset;

        var frame = frames[time];

        if (!frame) {
            var t = time >= duration ? duration : time;
            frame = frames[time] = timeline(t / duration);
        }

        window.requestAnimationFrame(frame);
    }

    onScroll();
    scrollTarget.addEventListener('scroll', onScroll);

    return {
        stop: function stop() {
            scrollTarget.removeEventListener('scroll', onScroll);
        }

    };
}
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{"./Player":1,"./Timeline":2}],"rotoscope-demo":[function(require,module,exports){
'use strict';

var rotoscope = require('rotoscope');

function createParallax() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var scrollDuration = document.body.offsetHeight - windowHeight;
    var spaceship = document.querySelector('.spaceship');
    var stars = document.getElementById('stars-two');
    var starsTwo = document.getElementById('stars-three');
    var spaceshipContainer = document.getElementById('spaceship-container');
    var meteorContainer = document.getElementById('meteor-container');
    var landedText = document.getElementById('landed-text');

    function createSpaceShipTimeline() {
        var timeline = rotoscope.createTimeline();

        function buildTransformString(position) {
            return 'translate3d(' + position.translateX + 'px, ' + position.translateY + 'px, 0) rotate(' + position.rotate + 'deg)';
        }

        function renderTransform(element, transform) {
            return function () {
                element.style.transform = transform;
                element.style.webkitTransform = transform;
            };
        }

        function rotate(time, deg, position) {
            position.rotate -= time * deg;

            return position;
        }

        function clone(obj) {
            return Object.keys(obj).reduce(function (seed, key) {
                seed[key] = obj[key];

                return seed;
            }, {});
        }

        function stepAnimation(initial) {
            var steps = [];

            return {
                addStep: function addStep(handler) {
                    var localSteps = steps.slice(0);
                    steps.push(handler);

                    return function (time) {
                        var position = localSteps.reduce(function (seed, handler) {
                            seed = handler(seed, 1);

                            return clone(seed);
                        }, clone(initial));

                        return handler(position, time);
                    };
                }
            };
        }

        var animation = stepAnimation({
            width: spaceship.offsetWidth,
            height: spaceship.offsetHeight,
            translateY: 0,
            translateX: 0,
            rotate: 90
        });

        var launchStep = animation.addStep(function (position, time) {
            var xDist = windowWidth * 0.2;

            position.translateX += time * xDist;

            return position;
        });

        function spaceshipFlying(time) {
            var position = launchStep(time);
            return renderTransform(spaceship, buildTransformString(position));
        }

        var firstRotateStep = animation.addStep(function (position, time) {
            position = rotate(time, -20, position);

            return position;
        });

        function spaceShipRotateDown(time) {
            var position = firstRotateStep(time);

            return renderTransform(spaceship, buildTransformString(position));
        }

        var firstSpeedBurst = animation.addStep(function (position, time) {
            var xDist = windowWidth * 0.6 - position.translateX - position.width / 2;
            var yDist = windowHeight * 0.5 - position.translateY - position.height / 2;

            position.translateX += time * xDist;
            position.translateY += time * yDist;

            return position;
        });

        var firstSpeedBurstClip = function firstSpeedBurstClip(time) {
            var position = firstSpeedBurst(time);

            return renderTransform(spaceship, buildTransformString(position));
        };

        var firstDodgeRotate = animation.addStep(function (position, time) {
            return rotate(time, 20, position);
        });

        var firstDodgeRotateClip = function firstDodgeRotateClip(time) {
            var position = firstDodgeRotate(time);

            return renderTransform(spaceship, buildTransformString(position));
        };

        var horizontal = animation.addStep(function (position, time) {
            var xDist = -(windowWidth * 0.3);
            position.translateX += time * xDist;

            return position;
        });

        var horizontalClip = function horizontalClip(time) {
            var position = horizontal(time);

            return renderTransform(spaceship, buildTransformString(position));
        };

        var prepareLanding = animation.addStep(function (position, time) {
            var xDist = windowWidth * 0.5 - position.width - position.translateX;
            var yDist = -100;
            var position = rotate(time, 90, position);

            position.translateX += time * xDist;
            position.translateY += time * yDist;

            return position;
        });

        var prepareLandingClip = function prepareLandingClip(time) {
            var position = prepareLanding(time);

            return renderTransform(spaceship, buildTransformString(position));
        };

        var landing = animation.addStep(function (position, time) {
            var groundTop = document.getElementById('ground').offsetHeight;
            var yDist = windowHeight - groundTop - position.translateY - position.height * 0.94;

            position.translateY += time * yDist;

            return position;
        });

        var landingClip = function landingClip(time) {
            var position = landing(time);

            return renderTransform(spaceship, buildTransformString(position));
        };

        return timeline.appendChild(spaceshipFlying, {
            offset: 0,
            duration: 10,
            fill: 'none'
        }).chainChild(spaceshipFlying, spaceShipRotateDown, {
            offset: 0,
            duration: 5,
            fill: 'none'
        }).chainChild(spaceShipRotateDown, firstSpeedBurstClip, {
            offset: 0,
            duration: 20,
            fill: 'none'
        }).chainChild(firstSpeedBurstClip, firstDodgeRotateClip, {
            offset: 0,
            duration: 5,
            fill: 'none'
        }).chainChild(firstDodgeRotateClip, horizontalClip, {
            offset: 0,
            duration: 100,
            fill: 'none'
        }).chainChild(horizontalClip, prepareLandingClip, {
            offset: 0,
            duration: 50,
            fill: 'none'
        }).chainChild(prepareLandingClip, landingClip, {
            offset: 0,
            duration: 50,
            fill: 'none'
        });
    }

    function createStarsTimeline() {
        return function (time) {
            var dist = -50;
            var transform = 'translate3d(0, ' + time * dist + 'px, 0)';

            return function () {
                stars.style.transform = transform;
                stars.style.webkitTransform = transform;
            };
        };
    }

    function createHorizontalStarsTimeline() {
        return function (time) {
            var dist = -(windowWidth * 0.5);
            var transform = 'translate3d(' + time * dist + 'px, 0, 0)';
            var starsOneTransform = 'translate3d(' + time * (dist * 0.3) + 'px, 0, 0)';

            return function () {
                stars.style.transform = starsOneTransform;
                starsTwo.style.transform = transform;

                stars.style.webkitTransform = starsOneTransform;
                starsTwo.style.webkitTransform = transform;
            };
        };
    }

    return rotoscope.createRotoscope(window).bounds({
        start: 0,
        duration: scrollDuration
    }).animate(function (timeline) {
        var spaceshipTimeline = createSpaceShipTimeline();
        var starsTimeline = createStarsTimeline();
        var horizontalStarsTimeline = createHorizontalStarsTimeline();

        function landedTextClip(time) {
            return function () {
                landedText.style.opacity = time;
            };
        }

        return timeline.appendChild(spaceshipTimeline, {
            offset: 0,
            duration: scrollDuration,
            fill: 'both'
        }).appendChild(horizontalStarsTimeline, {
            offset: windowHeight * 0.5,
            duration: windowHeight * 1.2
        }).appendChild(landedTextClip, {
            offset: scrollDuration * 0.95,
            duration: scrollDuration * 0.05,
            fill: 'both'
        });
    }).start();
}

var player = {};
function begin() {
    if (typeof player.stop === 'function') {
        player.stop();
    }

    player = createParallax();
}

window.addEventListener('resize', begin);
begin();

},{"rotoscope":3}]},{},[]);
