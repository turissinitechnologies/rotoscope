import { interpolate } from './../generated/slidein';
import { interpolate as interpolateBorderRadius } from './../generated/border';

const ball = document.querySelector('.ball') as HTMLElement;
const range = document.querySelector('input') as HTMLInputElement;

function renderFrame(time, duration) {
    const frame = interpolate(time, duration);
    frame.rules.forEach((rule) => {
        let value: string | number = rule.value;
        if (rule.units) {
            value = value + rule.units;
        }
        ball.style[rule.propertyName] = value;
    });

    const borderRadius = interpolateBorderRadius(time, duration);
    borderRadius.rules.forEach((rule) => {
        let value: string | number = rule.value;
        if (rule.units) {
            value = value + rule.units;
        }
        ball.style[rule.propertyName] = value;
    });
}

range.addEventListener('input', () => {
    const percent = parseFloat(range.value) / parseFloat(range.max);
    const time = percent * 400;
    renderFrame(
        time,
        400
    );
});



