import VideoContent from './video-content.js';

const defaultOptions = {
  // videoAttributes: { controls: '', playsinline: '' },
  // autoplay: true,
};

class PhotoSwipeVideoPlugin {
  constructor(lightbox, options) {
    lightbox.on('init', () => {
      this.handlePhotoSwipeInit(lightbox.pswp, options);
    });
  }

  handlePhotoSwipeInit(pswp, options) {
    this.pswp = pswp;
    this.options = {
      ...defaultOptions,
      ...options
    };


    if (window.pswpTempTestVars && window.pswpTempTestVars.prevent_dragging_over_video) {
      pswp.on('pointerDown', (e) => {
        if (e.originalEvent.target.tagName === 'VIDEO') {
          e.preventDefault();
        }
      });
    }

    // Prevent draggin when pointer is in bottom part of the video
    pswp.on('pointerDown', (e) => {
      const slide = pswp.currSlide;
      if (slide.data.type === 'video') {
        const origEvent = e.originalEvent;
        if (origEvent.type === 'pointerdown') {
          const videoHeight = Math.ceil(slide.height * slide.currZoomLevel);
          const verticalEnding = videoHeight + slide.bounds.center.y;
          const pointerYPos = origEvent.pageY - this.pswp.offset.y;
          if (pointerYPos > verticalEnding - 40 && pointerYPos < verticalEnding) {
            e.preventDefault();
          }
        }
      }
    });

    // do not append video on nearby slides
    pswp.on('appendHeavy', (e) => {
      if (e.slide.data.type === 'video' && !e.slide.isActive) {
        e.preventDefault();
      }
    });

    
    pswp.on('close', () => {
      if (pswp.currSlide.content && pswp.currSlide.content.type === 'video') {
        // Switch from zoom to fade closing transition,
        // as zoom transition is choppy for videos
        if (!pswp.options.showHideAnimationType
          || pswp.options.showHideAnimationType === 'zoom') {
          pswp.options.showHideAnimationType = 'fade';
        }

        // pause video when closing
        pswp.currSlide.content.pauseVideo();
      }
    });

    // always use placeholder for videos
    pswp.addFilter('placeholderSrc', (placeholderSrc, slide) => {
      if (slide.data.type === 'video') {
        return slide.data.msrc;
      }
      return placeholderSrc;
    });

    pswp.addFilter('domItemData', (itemData, element, linkEl) => {
      if (itemData.type === 'video' && linkEl) {
        if (linkEl.dataset.pswpVideoSources) {
          itemData.videoSources = JSON.parse(pswpVideoSources);
        } else if (linkEl.dataset.pswpVideoSrc) {
          itemData.videoSrc = linkEl.dataset.pswpVideoSrc;
        } else {
          itemData.videoSrc = linkEl.href;
        }
      }
    });

    pswp.addContentType('video', VideoContent);
  }
}

export default PhotoSwipeVideoPlugin;
