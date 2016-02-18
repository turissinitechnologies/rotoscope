# rotoscope

A functional timeline-based animation library.

## Installation
```
npm install rotoscope
```

## Description
Rotoscope is a super lightweight library designed to organize and compose animations in a fast and powerful way.
Rotoscope is 100% dependency free and is compatible with existing javascript animation frameworks like Greensock.

Rotoscope is different from other animation libraries because it focuses on a two-part render cycle: Updating and then Drawing.
Separating the render cycle into update and draw steps allows animations to scale in complexity without seeing performance problems.

Rotoscope also emphasis functional interfaces and a unique tree data structure for organizing timelines.

If you are building complex animations or parallax effects, rotoscope will becomes an indispensible tool.


## API

`Clips` provide the interface for rotoscope to interact with the outside world. 
`Clips` are simply update functions that return draw functions. Clips take a `time` value between 0 and 1 as an argument;

Creating a clip:

```
const myElement = document.getElementById('my-element');

function updateElementPosition (time) {
  const maxDistance = 500;
  const translate = `translate3d(${time * maxDistance}px, 0 0)`;
  
  return function drawElementPosition () {
    myElement.style.transform = translate;
  }
}


const drawHalfwayFrame = updateElementPosition(0.5);
drawHalfwayFrame(); // draws myElement 250px to right right

```

Notice that the only thing that is specific to rotoscope is the function signature. `updateElementPosition` should return a function that simply draws the translate string at a time.

Adding a updateElementPosition to a timeline:

```
const myTimeline = createTimeline();
myTimeline.appendChild(updateElementPosition, {
  offset: 0,
  duration: 10,
  fill: 'both'
});

```

When adding a `Clip` to a timeline, `offset`, `duration` and `fill` should be specified
 - `offset` describes where the clip should start on the timeline
 - `duration` describes the length of time that the clip should be updated
 - `fill` describes what happens when the timeline time is out of bounds beyond the `offset` and `duration`. It has 4 values:
   - `none` - Nothing happens, clip is skipped entirely.
   - `backwards` - When time is before clip, clip should be updated with time 0
   - `forwards` - When time is after clip, clip should be updated with time 1
   - `both` - Clip will always be updated regardless of the time
   

`Timelines` behave the same way as our custom clips:

const drawTimeline = myTimeline(0.5);
drawTimeline();

To make a `Timeline` playable, we can create a clock. rotoscope comes with two clocks:
  - requestAnimationFrame clock: Clock that uses requestAnimationFrame to time frames
  - scroll clock: Clock that uses scroll position to time frames. Useful for parallax.
  
```
  const clock = createRafClock(); // creating request animation frame clock
```


We should then create a player to consume our clock and timeline:

```
  const player = createPlayer(clock, timeline);
  player.play(); // Animation!
```
