import { terser } from "rollup-plugin-terser";
 
export default {
  input: "src/index.js",
  output: [
    { file: "dist/photoswipe-video-plugin.esm.js", format: "esm" },
    { file: "dist/photoswipe-video-plugin.esm.min.js", format: "esm", plugins: [ terser()] },
  ],
};
