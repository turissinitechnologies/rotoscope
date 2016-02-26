var rotoscope = require('rotoscope');

function createParallax () {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var scrollDuration = document.body.offsetHeight - windowHeight;
    var spaceship = document.querySelector('.spaceship');
    var stars = document.getElementById('stars-two');
    var starsTwo = document.getElementById('stars-three');
    var spaceshipContainer = document.getElementById('spaceship-container');
    var meteorContainer = document.getElementById('meteor-container');
    var landedText = document.getElementById('landed-text');

    function createSpaceShipTimeline () {
        var timeline = rotoscope.createTimeline();

        function buildTransformString (position) {
            return 'translate3d(' + position.translateX + 'px, ' + position.translateY + 'px, 0) rotate(' + position.rotate + 'deg)';
        }

        function renderTransform (element, transform) {
            return function () {
                element.style.transform = transform;
                element.style.webkitTransform = transform;
            }
        }

        function rotate (time, deg, position) {
            position.rotate -= (time * deg);

            return position;
        }

        function clone (obj) {
            return Object.keys(obj).reduce(function (seed, key) {
                seed[key] = obj[key];

                return seed;

            }, {});
        }

        function stepAnimation (initial) {
            const steps = [];

            return {
                addStep: function (handler) {
                    var localSteps = steps.slice(0);
                    steps.push(handler);

                    return function (time) {
                        var position = localSteps.reduce(function (seed, handler) {
                            seed = handler(seed, 1);

                            return clone(seed);

                        }, clone(initial));

                        return handler(position, time);
                    }


                }
            }

        }

        const animation = stepAnimation({
            width: spaceship.offsetWidth,
            height: spaceship.offsetHeight,
            translateY: 0,
            translateX: 0,
            rotate: 90
        });

        const launchStep = animation.addStep(function (position, time) {
            var xDist = windowWidth * 0.2;

            position.translateX += time * xDist

            return position;
        });

        function spaceshipFlying (time) {
            var position = launchStep(time);
            return renderTransform(spaceship, buildTransformString(position));
        }

        const firstRotateStep = animation.addStep(function (position, time) {
            position = rotate(time, -20, position);

            return position;
        });

        function spaceShipRotateDown (time) {
            var position = firstRotateStep(time);

            return renderTransform(spaceship, buildTransformString(position));
        }


        const firstSpeedBurst = animation.addStep(function (position, time) {
            var xDist = (windowWidth * 0.6) - position.translateX - (position.width / 2);
            var yDist = (windowHeight * 0.5) - position.translateY - (position.height / 2);

            position.translateX += time * xDist;
            position.translateY += time * yDist;

            return position;

        });

        const firstSpeedBurstClip = function (time) {
            var position = firstSpeedBurst(time);

            return renderTransform(spaceship, buildTransformString(position));
        }


        const firstDodgeRotate = animation.addStep(function (position, time) {
            return rotate(time, 20, position);
        });

        const firstDodgeRotateClip = function (time) {
            const position = firstDodgeRotate(time);

            return renderTransform(spaceship, buildTransformString(position));
        };


        const horizontal = animation.addStep(function (position, time) {
            var xDist = -(windowWidth * 0.3);
            position.translateX += time * xDist;

            return position;
        });

        const horizontalClip = function (time) {
            const position = horizontal(time);

            return renderTransform(spaceship, buildTransformString(position));
        }

        const prepareLanding = animation.addStep(function (position, time) {
            const xDist = (windowWidth * 0.5) - position.width - position.translateX;
            const yDist = -100;
            var position = rotate(time, 90, position);

            position.translateX += time * xDist;
            position.translateY += time * yDist;


            return position;
        });

        const prepareLandingClip = function (time) {
            const position = prepareLanding(time);

            return renderTransform(spaceship, buildTransformString(position));
        }


        const landing = animation.addStep(function (position, time) {
            const groundTop = document.getElementById('ground').offsetHeight;
            const yDist = (windowHeight - groundTop) - position.translateY - (position.height * 0.94);

            position.translateY += time * yDist;

            return position;
        });

        const landingClip = function (time) {
            const position = landing(time);

            return renderTransform(spaceship, buildTransformString(position));
        }


        return timeline.appendChild(spaceshipFlying, {
            offset: 0,
            duration: 10,
            fill: 'none'
        })
        .chainChild(spaceshipFlying, spaceShipRotateDown, {
            offset: 0,
            duration: 5,
            fill: 'none'
        })
        .chainChild(spaceShipRotateDown, firstSpeedBurstClip, {
            offset: 0,
            duration: 20,
            fill: 'none'
        })
        .chainChild(firstSpeedBurstClip, firstDodgeRotateClip, {
            offset: 0,
            duration: 5,
            fill: 'none'
        })
        .chainChild(firstDodgeRotateClip, horizontalClip, {
            offset: 0,
            duration: 100,
            fill: 'none'
        })
        .chainChild(horizontalClip, prepareLandingClip, {
            offset: 0,
            duration: 50,
            fill: 'none'
        })
        .chainChild(prepareLandingClip, landingClip, {
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
            }
        }
    }

    function createHorizontalStarsTimeline () {
        return function (time) {
            var dist = -(windowWidth * 0.5);
            var transform = 'translate3d(' + time * dist + 'px, 0, 0)';
            var starsOneTransform = 'translate3d(' + time * (dist * 0.3) + 'px, 0, 0)';

            return function () {
                stars.style.transform = starsOneTransform;
                starsTwo.style.transform = transform;

                stars.style.webkitTransform = starsOneTransform;
                starsTwo.style.webkitTransform = transform;
            }
        }
    }

    return rotoscope.createRotoscope(window)
        .bounds({
            start: 0,
            duration: scrollDuration
        })
        .animate(function (timeline) {
            const spaceshipTimeline = createSpaceShipTimeline();
            const starsTimeline = createStarsTimeline();
            const horizontalStarsTimeline = createHorizontalStarsTimeline();

            function landedTextClip (time) {
                return function () {
                    landedText.style.opacity = time;
                }
            }

            return timeline.appendChild(spaceshipTimeline, {
                offset: 0,
                duration: scrollDuration,
                fill: 'both'
            })
            .appendChild(horizontalStarsTimeline, {
                offset: windowHeight * 0.5,
                duration: windowHeight * 1.2
            })
            .appendChild(landedTextClip, {
                offset: scrollDuration * 0.95,
                duration: scrollDuration * 0.05,
                fill: 'both'
            });


        })
        .start();
    }

    var player = {};
    function begin () {
        if (typeof player.stop === 'function') {
            player.stop();
        }

        player = createParallax();
    }

    window.addEventListener('resize', begin);
    begin();
