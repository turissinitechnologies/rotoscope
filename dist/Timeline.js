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