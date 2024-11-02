import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.js",
  output: [
    { file: "dist/photoswipe-video-plugin.esm.js", format: "esm" },
    { file: "dist/photoswipe-video-plugin.esm.min.js", format: "esm", plugins: [ terser()] },
    { file: "dist/photoswipe-video-plugin.umd.js", format: "umd", name: "PhotoSwipeVideoPlugin" },
    { file: "dist/photoswipe-video-plugin.umd.min.js", format: "umd", name: "PhotoSwipeVideoPlugin", plugins: [ terser()] },
  ],
};
