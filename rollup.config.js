// rollup.config.js
export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/mini-gif.umd.js",
      name: "minigif",
      format: "umd",
    },
    {
      file: "dist/mini-gif.esm.js",
      name: "minigif",
      format: "esm",
    },
  ],
};
