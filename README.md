# Rotoscope

Timeline based parallax library. Make parallax effortless and enjoyable!

## Installation
```
npm install rotoscope
```

## Build and run

```
$ npm run build
$ npm start
```

## Examples
http://turissinitechnologies.github.io/rotoscope/

## Why Rotoscope?
Parallax is an awesome effect that can give your website and web app that surprise and delight that users will love you for. While parallax is awesome, it is not trivial to implement beyond simple translates. For complex animations, a more robust tool is needed and that tool is Rotoscope.

Rotoscope itself is a super lightweight parallax library that works on the idea of timeline-based animations. This library specializes only in parallax and is 100% dependency free. It is also compatible with existing javascript animation frameworks like Greensock.

To make parallax drawing as performant as possible, rotoscope implements a two part render cycle: Updating and then Drawing.
Separating the render cycle into updating and drawing allows your animations to becomes very complex without taking a performance hit. Your users will love the results!

Rotoscope is also based on timelines, which allow you to treat complex animations as a single unit. This will change the way you think about animation and also promote animations that are DRY, testable and really, really fun to show off.

If you are building complex animations or parallax effects, rotoscope will becomes an indispensible tool.

## Features
 - Timeline based animations in your parallax
 - High performance rendering
 - Very flexible Clip interface that separates update and drawing
 - Immutable API
 - Promotes DRY parallax animations
 - Supports animation chaining in parallax
 - Compatible with most existing animation libraries.
 - Video parallax


### Hello World example

To begin our parallax, we start by creating a `rotoscope` instance. The `rotoscope` object is what enables us to have super performant parallax. All methods on this object are chainable and  immutable. This means that when any of the methods below are called, you are returned a different `rotoscope` instance. This prevents unintended side effects from creeping into other, unrelated parts of your code.

We should start by importing our `createRotoscope` function to create a rotoscope instance with a scroll target. A `scroll target` is any element that will emit `scroll events`. In most cases, this will probably be the window:

```
  import { createRotoscope } from 'rotoscope';
  
  const rotoscope = createRotoscope(window);
```

After we create a `rotoscope` object, we should define its `bounds`. `bounds` simply describe when `scroll events` should effect parallax. In the example below, we should see animation updates between scroll positions 50 and 150.

```
  const rotoscopeWithBounds = rotoscope.bounds({
    start: 50,
    duration: 100
  });

```

We should now add some animations. By default, `rotoscope` instances are created with a single root `timeline` that encompasses the entire animation. This `timeline` is the argument in the animation factory example below.  We first create a `greenBallClip`, which is a custom clip function that takes time as an argument:

```
const rotoscopeWithAnimations = rotoscopeWithBounds.animate(function (timeline) {
  const greenBallClip = function (time) {
      var dist = 400;
      var y = -time * dist;
      var translate = 'scale3d(' + time + ', ' + time + ', 1)';

      return function () {
          greenBall.style.transform = translate;
      };
  };
  
  return timeline.appendChild(greenBallClip, {
    start: 0,
    duration: 100
  });
  
})

```


We can then start listening to scroll events and begin parallaxing

```
  rotoscopeWithAnimations.start();
```


### Clip

In the `animation factory` above, we create a `Clip` function and append it to the timeline. `Clip` functions are what drives the animation and are broken down into two parts: Update and Draw. The first part, Update, is the calculation that happens before Draw. This part of the process takes a single argument, `time`, that is always a value between 0 and 1. You an think of `time` as percent.

The Update function should take the `time` and calculate what the next frame will look like. It should return a function that will actually draw that frame. This is a core concept in `rotoscope` and enables powerful and performant animations.

In the following example, we create a clip that moves an element, greenBall, anywhere between 0 and 400 pixels:

```
const greenBallClip = function (time) {
      var dist = 400;
      var y = time * dist;
      var translate = 'translate3d(' + y + 'px, 0, 0)';

      return function () {
          greenBall.style.transform = translate;
      };
  };

```

### Timeline

Timelines allow us to compose animations together to truly make something special. They behave like trees (Like the DOM) and have children, which are `clip` functions and other timelines. They have an immutable API so appending a child will return a completely new `timeline` instance.

Adding our greenBallClip to a timeline:

```
const myTimeline = createTimeline();

myTimeline.appendChild(greenBallClip, {
  offset: 0,
  duration: 10,
  fill: 'both'
});

```

You can also 'glue' two `clip` functions together on a timeline. Say, for instance, that you wanted a red ball to move after the green ball was done. You could manually define an offset for the redball relative to the green ball, but that would be fragile. You can instead use the `chainChild` method on timeline to chain `clip` functions. This method takes three arguments: a `clip` function that already exists on the timeline. Another `clip` argument that will be chained to the end of the first argument. An `offset` object that defines time offsets -relative- to the first `clip`:

```
myTimeline.chainChild(greenBallClip, redBallClip, {
 offset: 0,
 duration: 10
});
```

In addition to `offset`, `duration`, you should also specify `fill` mode when appending a `clip` to a timeline. `fill` describes what happens when the timeline time is out of bounds beyond the `offset` and `duration`. It has 4 values:
   - `none` - Nothing happens, clip is skipped entirely.
   - `backwards` - When time is before clip, clip should be updated with time 0
   - `forwards` - When time is after clip, clip should be updated with time 1
   - `both` - Default. Clip will always be updated regardless of the time
   
