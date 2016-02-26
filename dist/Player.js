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