## Initialization

The plugin requires a single JS file (grab it from `dist/photoswipe-video-plugin.esm.js`) and can be initialized like this:

```html
 <script type="module">
import PhotoSwipeLightbox from './lib/photoswipe/photoswipe-lightbox.esm.js';
import PhotoSwipeVideoPlugin from './dist/photoswipe-video-plugin.esm.js';

const lightbox = new PhotoSwipeLightbox({
  gallery: '#gallery',
  children: 'a',
  pswpModule: './photoswipe.esm.js',
});

const videoPlugin = new PhotoSwipeVideoPlugin(lightbox, {
  // options
});

lightbox.init();
</script>
```

## Markup

If you're using just one format:

```html
<a
  href="my-video.mp4" 
  data-pswp-video-src="my-video.mp4"
  data-pswp-width="800"
  data-pswp-height="600"
  data-pswp-type="video">
  <img src="poster.jpg" alt="" />
</a>
```

`data-pswp-video-src` is optional, if it's not defined - `href` attribute will be used. 

Attributes `data-pswp-width`, `data-pswp-height` and `data-pswp-type` are required.

If you're serving multiple formats use `data-pswp-video-sources` attribute that accepts JSON strignified array:

```html
<a
  href="my-video.mp4" 
  data-pswp-width="800"
  data-pswp-height="600"
  data-pswp-type="video"
  data-pswp-video-sources='[{"src":"my-video.webm","type":"video/webm"},{"src":"my-video.mp4","type":"video/mp4"}]'>
  <img src="poster.jpg" alt="" />
</a>
```

If you're providing the data directly via object:

```js
{
  width: 800,
  height: 600
  type: 'video',
  msrc: 'poster.jpg',

  // if you're using just one source
  videoSrc: 'my-video.mp4',

  // Or for multiple sources;
  // videoSrc: [
  //   { src: 'my-video.webm', type: 'video/webm' },
  //   { src: 'my-video.mp4', type: 'video/mp4' }
  // ] 
}
```
