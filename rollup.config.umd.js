// rollup.config.js
export default {
    input: 'src/index.js',
    output: {
      file: 'dist/mini-gif.umd.js',
      name: 'minigif',
      format: 'umd'
    }
  };