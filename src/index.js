import { defaultOptions } from './default-options.js';
import VideoContentSetup from './video-content-setup.js';

class PhotoSwipeVideoPlugin {
  constructor(lightbox, options) {
    new VideoContentSetup(lightbox, {
      ...defaultOptions,
      ...options
    });
  }
}

export default PhotoSwipeVideoPlugin;
