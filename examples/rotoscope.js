(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  function interpolate(currentTime, totalTime) {
      const position = currentTime / totalTime;
      let marginLeft = {
          propertyName: "marginLeft",
          value: 0
      };
      if (position > 0 && position <= 1) {
          const elapsed = position - 0;
          const percentComplete = elapsed / 1;
          marginLeft = {
              propertyName: "marginLeft",
              value: 0 + percentComplete * 100,
              units: "px"
          };
      }
      return {
          rules: [marginLeft]
      };
  }

  function interpolate$1(currentTime, totalTime) {
      const position = currentTime / totalTime;
      let borderRadius = {
          propertyName: "borderRadius",
          value: 20,
          units: "px"
      };
      if (position > 0 && position <= 1) {
          const elapsed = position - 0;
          const percentComplete = elapsed / 1;
          borderRadius = {
              propertyName: "borderRadius",
              value: 20 + percentComplete * -20,
              units: "px"
          };
      }
      return {
          rules: [borderRadius]
      };
  }

  const ball = document.querySelector('.ball');
  const range = document.querySelector('input');
  function renderFrame(time, duration) {
      const frame = interpolate(time, duration);
      frame.rules.forEach((rule) => {
          let value = rule.value;
          if (rule.units) {
              value = value + rule.units;
          }
          ball.style[rule.propertyName] = value;
      });
      const borderRadius = interpolate$1(time, duration);
      borderRadius.rules.forEach((rule) => {
          let value = rule.value;
          if (rule.units) {
              value = value + rule.units;
          }
          ball.style[rule.propertyName] = value;
      });
  }
  range.addEventListener('input', () => {
      const percent = parseFloat(range.value) / parseFloat(range.max);
      const time = percent * 400;
      renderFrame(time, 400);
  });

}));
