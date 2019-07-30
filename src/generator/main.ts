import postcss from 'postcss';
import path from 'path';
import camelCase from 'camel-case';
import prettier from 'prettier';
import round from 'round-to';
const fs = require('fs-extra');


interface DeclarationValue {
    value: number;
    units?: string;
}

interface Keyframe {
    position: number;
    rule: DeclarationValue;
}

interface KeyframeList {
    propertyName: string;
    positions: Keyframe[];
}

interface KeyframeAnimation {
    name: string;
    frames: KeyframeList[];
}

function getKeyFramePosition(selector: string): number {
    if (selector === 'from') {
        return 0;
    } else if (selector === 'to') {
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

function parseDeclarationValue(decl: postcss.Declaration): DeclarationValue {
    const float = parseFloat(decl.value);
    const value: DeclarationValue = {
        value: float,
    };

    const units = decl.value.replace(float + '', '');

    if (units !== '') {
        value.units = units;
    }

    return value;
}

function createAnimation(rule: postcss.AtRule): KeyframeAnimation {
    const { nodes, params } = rule;
    const frames: {[key: string]:  KeyframeList } = nodes.reduce((seed: {[key: string]: KeyframeList }, rule: postcss.Rule) => {
        rule.nodes.forEach((keyframeNode: postcss.Declaration) => {
            const { prop: propName } = keyframeNode;
            let existing: KeyframeList = seed[propName];
            if (existing === undefined) {
                existing = seed[propName] = {
                    propertyName: keyframeNode.prop,
                    positions: [],
                }
            }
            existing.positions.push({
                position: getKeyFramePosition(rule.selector),
                rule: parseDeclarationValue(keyframeNode)
            });
        });

        return seed;
    }, {});
    const animation: KeyframeAnimation = {
        name: params,
        frames: Object.values(frames),
    };

    return animation;
}

function keylistFrameStatements(propertyIdentifier: string, list: KeyframeList): string {
    const clone = list.positions.slice(0);
    const firstFrame = clone[0];
    const lastPosition = clone.pop();

    const nested = clone.map((frame, index) => {
        const nextFrame = index === clone.length - 1 ? lastPosition : clone[index + 1];
        const duration = nextFrame.position - frame.position;
        const interpolateRange = round(nextFrame.rule.value - frame.rule.value, 5);
        return /*javascript*/`
            if (position > ${frame.position} && position <= ${nextFrame.position}) {
                const elapsed = position - ${frame.position};
                const percentComplete = elapsed / ${duration};
                ${propertyIdentifier} = {
                    propertyName: '${propertyIdentifier}',
                    value: ${frame.rule.value} + (percentComplete * (${interpolateRange})),
                    ${nextFrame.rule.units === undefined ? '' : `units: '${nextFrame.rule.units}'`}
                }
            }
        `;
    }).join('\n\n');

    return /*javascript*/`
        let ${propertyIdentifier}: KeyframeRule = {
            propertyName: '${propertyIdentifier}',
            value: ${firstFrame.rule.value},
            ${firstFrame.rule.units === undefined ? '' : `units: '${firstFrame.rule.units}'`}
        };
        ${nested}
    `;
}


function generateInterpolation(animation: KeyframeAnimation): string {
    const identifiers: string[] = [];
    const statements: string = animation.frames.map((list) => {
        const identifier = camelCase(list.propertyName);
        identifiers.push(identifier);
        return keylistFrameStatements(identifier, list);
    }).join('\n\n');


    return /*javascript*/`
        interface KeyframeRule {
            propertyName: string;
            value: number;
            units?: string;
        }

        interface Keyframe {
            rules: KeyframeRule[]
        }
        export function interpolate(currentTime: number, totalTime: number): Keyframe {
            const position = currentTime / totalTime;
            ${statements}
            return {
                rules: [
                    ${identifiers.join(',\n')}
                ]
            }
        }
    `;
}

const css = fs.readFileSync(path.resolve('./examples/animation.css')).toString();

postcss([]).process(css).then((result) => {
    result.root.nodes.filter((node) => {
        return node.type === 'atrule' && node.name === 'keyframes';
    })
    .map(createAnimation)
    .forEach((animation) => {
        const source = generateInterpolation(animation);
        const pretty = prettier.format(source);
        fs.mkdirpSync('./src/generated');
        fs.writeFileSync(path.resolve(`./src/generated/${animation.name}.ts`), pretty);
    });
});