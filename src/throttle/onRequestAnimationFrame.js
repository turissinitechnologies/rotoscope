'use strict';


export default function (handler) {
    let raf;

    return function () {
        const throttleArgs = arguments;
        if (!raf) {
            raf = window.requestAnimationFrame(function (time) {
                handler(...throttleArgs);
                raf = null;
            });
        }
    };

};
