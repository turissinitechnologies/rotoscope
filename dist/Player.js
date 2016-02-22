'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createPlayer = createPlayer;
function createPlayer(timeline, scrollTarget) {
    var duration = timeline.duration || 1;
    var frames = [];
    var raf = undefined;

    window.addEventListener('scroll', function () {
        var time = scrollTarget.pageYOffset;

        var frame = frames[time];

        if (!frame) {
            var t = time >= duration ? duration : time;
            frame = frames[time] = timeline(t / duration);
        }

        window.requestAnimationFrame(frame);
    });

    return {};
}