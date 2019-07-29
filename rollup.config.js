import path from 'path';
import typescript from 'rollup-plugin-typescript2';

const entry = path.join(__dirname, 'src', 'main.ts');
const dist = path.join(__dirname, 'dist');

function rollupConfig(config) {
    const { format, target } = config;
    return {
        input: entry,
        output: {
            file: `${dist}/${format}/${target}/rotoscope.js`,
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
    rollupConfig({ format: 'es', target: 'es2018' }),
    rollupConfig({ format: 'cjs', target: 'es2018' }),
    rollupConfig({ format: 'umd', target: 'es2018' })
];
