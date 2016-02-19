'use strict';

export function createTimeline (clips = []) {

    function getClipsAtTime (timelineTime) {
        return clips.filter((clip) => {
            const fill = clip.fill;
            let start = clip.offset;
            let end = start + clip.duration;

            if (fill === 'none' && (timelineTime >= start && timelineTime <= end)) {
                return clip;
            } else if (fill === 'backwards' && (timelineTime <= end)) {
                return clip;
            } else if (fill === 'forwards' && (timelineTime >= start)) {
                return clip;
            } else if (fill === 'both'){
                return clip;
            }
        });
    };

    const drawFunctions = [];

    const timeline = function (time) {
        const duration = timeline.duration;
        const timelineTime = duration * time;
        const clips = getClipsAtTime(timelineTime);

        const drawFunctions = clips.map(function (clip) {
            const offset = clip.offset;
            const fill = clip.fill;
            const duration = clip.duration;
            const end = duration + offset;
            let clipTime = timelineTime - offset;

            if ((fill === 'backwards' || fill === 'both') && (timelineTime < offset)) {
                clipTime = 0;
            } else if ((fill === 'forwards' || fill === 'both') && (timelineTime > end)) {
                clipTime = duration;
            }

            const clipPercent = clipTime / duration;
            return clip.clip(clipPercent);
        });

        return function () {
            drawFunctions.forEach(function (h) {
                if (typeof h === 'function') {
                    h();
                }
            });
        }
    }

    timeline.chainChild = function (child, clip, relativeBounds = {}) {
        const childBounds = clips.filter((clip) => {
            return clip.clip === child;
        })[0];

        const relativeOffset = (typeof relativeBounds.offset === 'number') ? relativeBounds.offset : 0;

        const offset = childBounds.offset + childBounds.duration + relativeOffset;

        const bounds = Object.assign(relativeBounds, {
            offset: offset
        });

        return this.appendChild(clip, bounds);

    }

    timeline.appendChild = function (clip, { offset = 0, fill = 'both', duration }) {
        let clipDuration = 1;

        if (typeof duration === 'number') {
            clipDuration = duration;
        } else if (typeof clip.duration === 'number') {
            clipDuration = clip.duration;
        }

        const timeBounds = {
            offset,
            fill,
            duration: clipDuration
        };

        const clipsClone = clips.slice(0);
        clipsClone.push({
            clip,
            offset,
            fill,
            duration: clipDuration
        });

        return createTimeline(clipsClone);

    };

    Object.defineProperty(timeline, 'duration', {
        get: function () {
            return clips.reduce((seed, clip) => {
                if (clip.offset + clip.duration > seed) {
                    return clip.offset + clip.duration;
                }

                return seed;
            }, 0);
        }
    });

    return timeline;

};
