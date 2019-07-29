'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var postcss = _interopDefault(require('postcss'));
var path = _interopDefault(require('path'));
var camelCase = _interopDefault(require('camel-case'));
var prettier = _interopDefault(require('prettier'));
var round = _interopDefault(require('round-to'));

const fs = require('fs');
const css = /*css*/ `
    @keyframes slidein {
        0% {
            opacity: 0;
            padding-left: 10;
        }

        50% {
            opacity: 0.1;
        }

        75% {
            opacity: 0.8;
        }

        100% {
            padding-left: 100;
            opacity: 1;
        }
    }

    .ball {
        background: red;
        height: 20px;
        width: 20px;
        border-radius: 20px;
        animation-duration: 400ms;
        animation-name: slidein;
        animation-timing-function: ease-in-out;
        animation-fill-mode: forwards;
    }
`;
function getKeyFramePosition(selector) {
    if (selector === 'from') {
        return 0;
    }
    else if (selector === 'to') {
        return 1;
    }
    return parseFloat(selector) / 100;
}
// function parseTransform3d(value: string): Transform3d {
//     const values: DeclarationValue[] = value.replace('translate3d(', '').replace(')', '').split(',').map((i) => {
//         const value = parseFloat(i);
//         return {
//             value,
//             units: i.replace(value + '', '')
//         }
//     });
//     return {
//         x: values[0],
//         y: values[1],
//         z: values[2],
//     };
// }
function parseDeclarationValue(decl) {
    return {
        value: parseFloat(decl.value),
    };
}
function createAnimation(rule) {
    const { nodes, params } = rule;
    const frames = nodes.reduce((seed, rule) => {
        rule.nodes.forEach((keyframeNode) => {
            const { prop: propName } = keyframeNode;
            let existing = seed[propName];
            if (existing === undefined) {
                existing = seed[propName] = {
                    propertyName: keyframeNode.prop,
                    positions: [],
                };
            }
            existing.positions.push({
                position: getKeyFramePosition(rule.selector),
                rule: parseDeclarationValue(keyframeNode)
            });
        });
        return seed;
    }, {});
    const animation = {
        name: params,
        frames: Object.values(frames),
    };
    return animation;
}
function keylistFrameStatements(propertyIdentifier, list) {
    const clone = list.positions.slice(0);
    const firstFrame = clone[0];
    const lastPosition = clone.pop();
    const nested = clone.map((frame, index) => {
        const nextFrame = index === clone.length - 1 ? lastPosition : clone[index + 1];
        const duration = nextFrame.position - frame.position;
        const interpolateRange = round(nextFrame.rule.value - frame.rule.value, 5);
        return /*javascript*/ `
            if (position > ${frame.position} && position <= ${nextFrame.position}) {
                const elapsed = position - ${frame.position};
                const percentComplete = elapsed / ${duration};
                ${propertyIdentifier} = ${frame.rule.value} + (percentComplete * (${interpolateRange}));
            }
        `;
    }).join('\n\n');
    return /*javascript*/ `
        let ${propertyIdentifier} = ${firstFrame.rule.value};
        ${nested}
    `;
}
function generateInterpolation(animation) {
    const identifiers = [];
    const statements = animation.frames.map((list) => {
        const identifier = camelCase(list.propertyName);
        identifiers.push(identifier);
        return keylistFrameStatements(identifier, list);
    }).join('\n\n');
    const returnMap = identifiers.map((identifier) => {
        return `${identifier}: ${identifier}`;
    }).join(',\n');
    return /*javascript*/ `
        function interpolate(currentTime, totalTime) {
            const position = currentTime / totalTime;
            ${statements}
            return {
                ${returnMap}
            }
        }
    `;
}
postcss([]).process(css).then((result) => {
    const animations = result.root.nodes.filter((node) => {
        return node.type === 'atrule' && node.name === 'keyframes';
    })
        .map(createAnimation);
    const source = generateInterpolation(animations[0]);
    const pretty = prettier.format(source);
    fs.writeFileSync(path.resolve('./examples/test.js'), pretty);
});
