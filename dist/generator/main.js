"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var postcss_1 = __importDefault(require("postcss"));
var path_1 = __importDefault(require("path"));
var camel_case_1 = __importDefault(require("camel-case"));
var prettier_1 = __importDefault(require("prettier"));
var round_to_1 = __importDefault(require("round-to"));
var fs = require('fs-extra');
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
    var float = parseFloat(decl.value);
    var value = {
        value: float
    };
    var units = decl.value.replace(float + '', '');
    if (units !== '') {
        value.units = units;
    }
    return value;
}
function createAnimation(rule) {
    var nodes = rule.nodes, params = rule.params;
    var frames = nodes.reduce(function (seed, rule) {
        rule.nodes.forEach(function (keyframeNode) {
            var propName = keyframeNode.prop;
            var existing = seed[propName];
            if (existing === undefined) {
                existing = seed[propName] = {
                    propertyName: keyframeNode.prop,
                    positions: []
                };
            }
            existing.positions.push({
                position: getKeyFramePosition(rule.selector),
                rule: parseDeclarationValue(keyframeNode)
            });
        });
        return seed;
    }, {});
    var animation = {
        name: params,
        frames: Object.values(frames)
    };
    return animation;
}
function keylistFrameStatements(propertyIdentifier, list) {
    var clone = list.positions.slice(0);
    var firstFrame = clone[0];
    var lastPosition = clone.pop();
    var nested = clone.map(function (frame, index) {
        var nextFrame = index === clone.length - 1 ? lastPosition : clone[index + 1];
        var duration = nextFrame.position - frame.position;
        var interpolateRange = round_to_1["default"](nextFrame.rule.value - frame.rule.value, 5);
        return /*javascript*/ "\n            if (position > " + frame.position + " && position <= " + nextFrame.position + ") {\n                const elapsed = position - " + frame.position + ";\n                const percentComplete = elapsed / " + duration + ";\n                " + propertyIdentifier + " = {\n                    propertyName: '" + propertyIdentifier + "',\n                    value: " + frame.rule.value + " + (percentComplete * (" + interpolateRange + ")),\n                    " + (nextFrame.rule.units === undefined ? '' : "units: '" + nextFrame.rule.units + "'") + "\n                }\n            }\n        ";
    }).join('\n\n');
    return /*javascript*/ "\n        let " + propertyIdentifier + ": KeyframeRule = {\n            propertyName: '" + propertyIdentifier + "',\n            value: " + firstFrame.rule.value + ",\n            " + (firstFrame.rule.units === undefined ? '' : "units: '" + firstFrame.rule.units + "'") + "\n        };\n        " + nested + "\n    ";
}
function generateInterpolation(animation) {
    var identifiers = [];
    var statements = animation.frames.map(function (list) {
        var identifier = camel_case_1["default"](list.propertyName);
        identifiers.push(identifier);
        return keylistFrameStatements(identifier, list);
    }).join('\n\n');
    return /*javascript*/ "\n        interface KeyframeRule {\n            propertyName: string;\n            value: number;\n            units?: string;\n        }\n\n        interface Keyframe {\n            rules: KeyframeRule[]\n        }\n        export function interpolate(currentTime: number, totalTime: number): Keyframe {\n            const position = currentTime / totalTime;\n            " + statements + "\n            return {\n                rules: [\n                    " + identifiers.join(',\n') + "\n                ]\n            }\n        }\n    ";
}
var css = fs.readFileSync(path_1["default"].resolve('./examples/animation.css')).toString();
postcss_1["default"]([]).process(css).then(function (result) {
    result.root.nodes.filter(function (node) {
        return node.type === 'atrule' && node.name === 'keyframes';
    })
        .map(createAnimation)
        .forEach(function (animation) {
        var source = generateInterpolation(animation);
        var pretty = prettier_1["default"].format(source);
        fs.mkdirpSync('./src/generated');
        fs.writeFileSync(path_1["default"].resolve("./src/generated/" + animation.name + ".ts"), pretty);
    });
});
