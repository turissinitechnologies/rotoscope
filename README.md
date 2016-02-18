# rotoscope

A functional timeline-based animation library.

## Installation
```
npm install rotoscope
```

## Description
Rotoscope is a super lightweight timeline-based animation library designed specifically for parallax animations.
Rotoscope is 100% dependency free and is compatible with existing javascript animation frameworks like Greensock.

To make parallax drawing as performant as possible, rotoscope implements a two part render cycle: Updating and then Drawing.
Separating the render cycle into updating and drawing allows your animations to becomes very complex without taking a performance hit. Your users will love the results!

Rotoscope is also based on timelines, which allow you to treat complex animations as a single unit. This will change the way you think about animation and also promote animations that are DRY, testable and really, really fun to show off.

If you are building complex animations or parallax effects, rotoscope will becomes an indispensible tool.


## API

`Clip API` or `Clips` define how your parallax animations should render on the page.
`Clips` are pure functions that take time as an argument. When `Clips` are called, they should calculate what the frame at `time` should look like. The `Clip` should then return a function that will draw at a later time. Clips have one argument, `time`, which is a number between 0 and 1. You can think of `time` as a percentage.

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

Notice that the only thing that is specific to rotoscope is the function signature. `updateElementPosition` should return a function that simply draws the translate string at a time. You could easily insert GreenSock or any other animation framework into either of these functions and still get the benefits that rotoscope offers.

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


We should then create a player to consume our timeline:

```
  const player = createPlayer(timeline); // Animation!
```

By default, the `player` will use the `window` object as its scroll target. If you need another element, simply create a scroll clock:

```
  const clock = createScrollClock(myScrollElement);
  const player = createPlayer(timeline, clock); // Parallax not tied to window!
  
```
