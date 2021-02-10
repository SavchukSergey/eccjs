import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

const plugins = () => [
    commonjs(),
    typescript(),
];

function cjs(fileName) {
    return {
        file: fileName,
        format: "cjs",
        exports: "named",
        sourcemap: true,
    };
}

function es(fileName) {
    return {
        file: fileName,
        format: "es",
        exports: "named",
        sourcemap: true,
    };
}

const config = [{
    input: "src/index.ts",
    output: [cjs(pkg.main), es(pkg.module)],
    plugins: plugins(),
}];

export default config;
