/*!
  * PhotoSwipe Lightbox 5.1.7 - https://photoswipe.com
  * (c) 2021 Dmitry Semenov
  */
/**
  * Creates element and optionally appends it to another.
  *
  * @param {String} className
  * @param {String|NULL} tagName
  * @param {Element|NULL} appendToEl
  */
function createElement(className, tagName, appendToEl) {
  const el = document.createElement(tagName || 'div');
  if (className) {
    el.className = className;
  }
  if (appendToEl) {
    appendToEl.appendChild(el);
  }
  return el;
}

/**
 * Apply width and height CSS properties to element
 */
function setWidthHeight(el, w, h) {
  el.style.width = (typeof w === 'number') ? (w + 'px') : w;
  el.style.height = (typeof h === 'number') ? (h + 'px') : h;
}

const LOAD_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
};

class Content {
  /**
   * @param {Object} itemData Slide data
   * @param {PhotoSwipeBase} instance PhotoSwipe or PhotoSwipeLightbox instance
   * @param {Slide|undefined} slide Slide that requested the image,
   *                                can be undefined if image was requested by something else
   *                                (for example by lazy-loader)
   */
  constructor(itemData, instance) {
    this.options = instance.options;
    this.instance = instance;
    this.data = itemData;

    this.width = Number(this.data.w) || Number(this.data.width) || 0;
    this.height = Number(this.data.h) || Number(this.data.height) || 0;

    this.isAttached = false;
    this.state = LOAD_STATE.IDLE;
  }

  setSlide(slide) {
    this.slide = slide;
    this.pswp = slide.pswp;
  }

  /**
   * Load the content
   *
   * @param {Boolean} isLazy If method is executed by lazy-loader
   */
  load(/* isLazy */) {
    if (!this.element) {
      this.element = createElement('pswp__content');
      this.element.style.position = 'absolute';
      this.element.style.left = 0;
      this.element.style.top = 0;
      this.element.innerHTML = this.data.html || '';
    }
  }

  isZoomable() {
    return false;
  }

  usePlaceholder() {
    return false;
  }

  activate() {

  }

  deactivate() {

  }

  setDisplayedSize(width, height) {
    if (this.element) {
      setWidthHeight(this.element, width, height);
    }
  }

  onLoaded() {
    this.state = LOAD_STATE.LOADED;

    if (this.slide) {
      this.pswp.dispatch('loadComplete', { slide: this.slide });
    }
  }

  // If the placeholder should be kept in DOM
  keepPlaceholder() {
    return (this.state === LOAD_STATE.LOADING);
  }

  onError() {
    this.state = LOAD_STATE.ERROR;

    if (this.slide) {
      this.pswp.dispatch('loadComplete', { slide: this.slide, isError: true });
      this.pswp.dispatch('loadError', { slide: this.slide });
    }
  }

  getErrorElement() {
    return false;
  }


  remove() {
    this.isAttached = false;
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  }

  appendTo(container) {
    this.isAttached = true;
    if (this.element && !this.element.parentNode) {
      container.appendChild(this.element);
    }
  }

  destroy() {

  }
}

class ImageContent extends Content {
  load(/* isLazy */) {
    if (this.element) {
      return;
    }

    const imageSrc = this.data.src;

    if (!imageSrc) {
      return;
    }

    this.element = createElement('pswp__img', 'img');

    if (this.data.srcset) {
      this.element.srcset = this.data.srcset;
    }

    this.element.src = imageSrc;

    this.element.alt = this.data.alt || '';

    this.state = LOAD_STATE.LOADING;

    if (this.element.complete) {
      this.onLoaded();
    } else {
      this.element.onload = () => {
        this.onLoaded();
      };

      this.element.onerror = () => {
        this.onError();
      };
    }
  }

  setDisplayedSize(width, height) {
    const image = this.element;
    if (image) {
      setWidthHeight(image, width, 'auto');

      // Handle srcset sizes attribute.
      //
      // Never lower quality, if it was increased previously.
      // Chrome does this automatically, Firefox and Safari do not,
      // so we store largest used size in dataset.
      if (image.srcset
          && (!image.dataset.largestUsedSize || width > image.dataset.largestUsedSize)) {
        image.sizes = width + 'px';
        image.dataset.largestUsedSize = width;
      }

      if (this.slide) {
        this.pswp.dispatch('imageSizeChange', { slide: this.slide, width, height });
      }
    }
  }

  isZoomable() {
    return (this.state !== LOAD_STATE.ERROR);
  }

  usePlaceholder() {
    return true;
  }

  lazyLoad() {
    this.load();
  }

  destroy() {
    if (this.element) {
      this.element.onload = null;
      this.element.onerror = null;
      this.element = null;
    }
  }

  appendTo(container) {
    this.isAttached = true;

    // Use decode() on nearby slides
    //
    // Nearby slide images are in DOM and not hidden via display:none.
    // However, they are placed offscreen (to the left and right side).
    //
    // Some browsers do not composite the image until it's actually visible,
    // using decode() helps.
    //
    // You might ask "why dont you just decode() and then append all images",
    // that's because I want to show image before it's fully loaded,
    // as browser can render parts of image while it is loading.
    if (this.slide && !this.slide.isActive && ('decode' in this.element)) {
      this.isDecoding = true;
      // Make sure that we start decoding on the next frame
      requestAnimationFrame(() => {
        if (this.element) {
          this.element.decode().then(() => {
            this.isDecoding = false;
            requestAnimationFrame(() => {
              this.appendImageTo(container);
            });
          }).catch(() => {});
        }
      });
    } else {
      this.appendImageTo(container);
    }
  }

  activate() {
    if (this.slide && this.slide.container && this.isDecoding) {
      // add image to slide when it becomes active,
      // even if it's not finished decoding
      this.appendImageTo(this.slide.container);
    }
  }

  getErrorElement() {
    const el = createElement('pswp__error-msg-container');
    el.innerHTML = this.options.errorMsg;
    const linkEl = el.querySelector('a');
    if (linkEl) {
      linkEl.href = this.data.src;
    }
    return el;
  }

  appendImageTo(container) {
    // ensure that element exists and is not already appended
    if (this.element && !this.element.parentNode && this.isAttached) {
      container.appendChild(this.element);
    }
  }
}

// TODO: pass options from main obj
const options = {
  videoAttributes: { controls: '', playsinline: '', preload: 'auto' },
  autoplay: true,
};

class VideoContent extends ImageContent {
  load() {
    if (this.element) {
      return;
    }

    this.state = 'loading';
    this.type = 'video'; // TODO: move this to pswp core?

    this.element = document.createElement('video');

    if (window.pswpTempTestVars && !window.pswpTempTestVars.play_inline) {
      delete options.videoAttributes['playsinline'];
    }
    if (options.videoAttributes) {
      for(let key in options.videoAttributes) {
        this.element.setAttribute(key, options.videoAttributes[key] || '');
      }
    }

    this.element.setAttribute('poster', this.data.msrc);

    this.preloadVideoPoster(this.data.msrc);

    this.element.style.position = 'absolute';
    this.element.style.left = 0;
    this.element.style.top = 0;
    
    if (this.data.videoSources) {
      this.data.videoSources.forEach((source) => {
        let sourceEl = document.createElement('source');
        sourceEl.src = source.src;
        sourceEl.type = source.type;
        this.element.appendChild(sourceEl);
      });
    } else if (this.data.videoSrc) {
      // Force video preload
      // https://muffinman.io/blog/hack-for-ios-safari-to-display-html-video-thumbnail/
      // this.element.src = this.data.videoSrc + '#t=0.001';
      this.element.src = this.data.videoSrc;
    }
  }

  activate() {
    //if (options.autoplay) {
    if (window.pswpTempTestVars && !window.pswpTempTestVars.autoplay_video) {
      return;
    }
    
    this.playVideo();
  }

  deactivate() {
    this.pauseVideo();
  }

  playVideo() {
    if (this.element) {
      this.element.play();
    }
  }

  pauseVideo() {
    if (this.element) {
      this.element.pause();
    }
  }

  appendTo(container) {
    this.isAttached = true;
    this.appendImageTo(container);
  }

  isZoomable() {
     return false;
  }

  keepPlaceholder() {
    return true;
  }
  
  setDisplayedSize(width, height) {
    if (this.element) {
      this.element.style.width = width + 'px';
      this.element.style.height = height + 'px';
    }

    if (this.slide && this.slide.placeholder) {
      // override placeholder size, so it more accurately matches the video
      const placeholderElStyle = this.slide.placeholder.element.style;
      placeholderElStyle.transform = 'none';
      placeholderElStyle.width = width + 'px';
      placeholderElStyle.height = height + 'px';
    }
  }

  destroy() {
    super.destroy();
    if (this._videoPosterImg) {
      this._videoPosterImg.onload =  this._videoPosterImg.onerror = null;
      this._videoPosterImg = null;
    }
  }

  preloadVideoPoster(src) {
    if (!this._videoPosterImg && src) {
      this._videoPosterImg = new Image();
      this._videoPosterImg.src = src;
      if (this._videoPosterImg.complete) {
        this.onLoaded();
      } else {
        this._videoPosterImg.onload =  this._videoPosterImg.onerror = () => {
          this.onLoaded();
        };
      }
    }
  }
}

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

export { PhotoSwipeVideoPlugin as default };
