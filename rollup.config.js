import path from 'path';
import typescript from 'rollup-plugin-typescript2';

const entry = path.join(__dirname, 'src', 'engine', 'main.ts');
const dist = path.join(__dirname, 'examples');

function rollupConfig(config) {
    const { format, target } = config;
    return {
        input: entry,
        output: {
            file: `${dist}/rotoscope.js`,
            format,
        },
        plugins: [
            typescript({
                clean: true,
                tsconfigOverride: {
                    compilerOptions: {
                        target,
                    },
                },
            }),
        ],
    };
}

export default [
    rollupConfig({ format: 'umd', target: 'es2018' })
];
