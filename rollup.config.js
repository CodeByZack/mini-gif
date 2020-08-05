// rollup.config.js

import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: {
      file: 'bundle.js',
      name: 'minigif',
      format: 'umd'
    },
    plugins : [terser()]
  };