// rollup.config.js

import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: {
      file: 'dist/mini-gif.min.js',
      name: 'minigif',
      format: 'umd'
    },
    plugins : [terser()]
  };