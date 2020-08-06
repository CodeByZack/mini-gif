// rollup.config.js

import { terser } from "rollup-plugin-terser";
export default {
    input: 'src/index.js',
    output: {
      file: 'dist/mini-gif.esm.js',
      name: 'minigif',
      format: 'esm'
    },
    plugins : [terser()]
  };