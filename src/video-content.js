import { ImageContent } from '../lib/photoswipe/photoswipe-lightbox.esm.js';

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

export default VideoContent;
