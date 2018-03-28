/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>
*/

// jshint esversion: 6, undef: true, unused: true
/* global window, document, setTimeout, clearTimeout, requestAnimationFrame,
          console
*/


(function(window, document, navigator) {
  'use strict';

  // const werror = window.console.log;

  // Storage for all created carousels.
  const carousels = [];

  // Storage for match media sizes.
  const mediaQueries = {};

  // When we get a media match we don't act upon it immediately but only
  // execute on the last one.
  // This is the interval ids for matches and no
  // matches. The latter is needed if no media is matched, in which case we
  // need to set the default media.
  let mmcival, nomatchival;
  const onMatchMediaChange = function(e) {
    if (e.matches) {
      h.each(carousels, c => {
        if (c.hasMediaQueries()) {
          if (mmcival) {
            clearTimeout(mmcival);
          }

          if (nomatchival) {
            clearTimeout(nomatchival);
          }

          mmcival = setTimeout(() => {
            mmcival = null;
            nomatchival = null;
            c.changeMedia(e.media);
          }, 5);
        }
      });
    }
    else if (!mmcival) {
      if (nomatchival) {
        clearTimeout(nomatchival);
      }
      nomatchival = setTimeout(() => {
        h.each(carousels, c => {
          if (c.hasMediaQueries()) {
            c.changeMedia();
          }
        });
        mmcival = null;
        nomatchival = null;
      }, 5);
    }
  };

  const isTouch = (('ontouchstart' in window)       ||
                   (navigator.maxTouchPoints   > 0) ||
                   (navigator.msMaxTouchPoints > 0));


  /*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
   |                                                                         |
   *                                Helpers                                  *
   |                                                                         |
   *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/

  const h = {
    // Get elements by class name
    getByClass: function(el, cls, one) {
      const e = el.getElementsByClassName(cls);

      if (one && e.length) {
        return e[0];
      }

      return e.length && e || undefined;
    },

    // Get elements by tag name
    getByTag: function(el, tag, one) {
      const e = el.getElementsByTagName(tag);

      if (one) {
        if (e && e.length) {
          return e[0];
        }
      }

      return e;
    },

    // Create element
    mkel: function(tag, attr) {
      var e = document.createElement(tag);

      if (attr) {
        const keys = Object.keys(attr);
        for (let i = 0; i < keys.length; i++) {
          e.setAttribute(keys[i], attr[keys[i]]);
        }
      }

      return e;
    },

    // Iterate over what and call cb on each iteration. If cb returns
    // false the loop is escaped.
    each: (what, cb) => {
      let cbres;
      for (let i = 0; i < what.length; i++) {
        cbres = cb.call(this, what[i]);
        if (cbres === false) {
          break;
        }
      }
    },

    // Add media query to check in window.matchMedia
    addMediaQuery: (mq) => {
      if (!mediaQueries[mq]) {
        mediaQueries[mq] = true;
        window.matchMedia(mq).addListener(onMatchMediaChange);
      }
    },

    // Calculate the swipe threshold in percent if that's requested
    // FIXME: This does not work as expected in an actual iPhone.
    setPercentTouchThreshold: function (val, conf) {
      const w = window.outerWidth;
      const px = Math.abs(Math.round(w / (100/val)));
      conf.touchthreshold = px;
    },

    // Same as Element.closest, which is used if available.
    closest: (node, selector) => {
      if (node.closest) {
        return node.closest(selector);
      }

      try {
        do {
          node = node.parentNode;

          if (node) {
            const test = node.querySelector(selector);

            if (test) {
              return test;
            }
          }
        } while (node);
      }
      catch (e) {
        console.error(e);
        return null;
      }
    },

    debounce: (f, w, i) => {
      let t;
      return function() {
        let args = arguments;
        let later = () => {
          t = null;
          if (!i) f.apply(this, args);
        };

        let cn = i && !t;
        clearTimeout(t);
        t = setTimeout(later, w);
        if (cn) {
          f.apply(this, args);
        }
      };
    }
  };


  /*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
   |                                                                         |
   *                                Carousel                                 *
   |                                                                         |
   *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/

  /*
    Creates a new Carousel object
    @param HTMLElement el
  */
  const Carousel = function(el) {
    this.config = {
      delay:          8000,
      transition:     'slide',
      touchthreshold: 80,
      // This must at least be 1 (no rubber band effect)
      swipeRubberBand: 1
    };

    const _ds = el.dataset,
      _cfg = this.config;

    carousels.push(this);

    this.element       = el;
    this.useIndicators = _ds.carouselIndicators !== undefined;
    // Storage for Carousel.Indicator objects
    this.indicators    = [];
    this.slider        = h.getByClass(el, 'carousel-slider', true);
    // Storage for Carousel.Item objects
    this.items         = [];
    // Interval ID for transitions between items
    this.ivalId        = null;
    // Current item
    this.currPos       = 0;
    // Flag for if multiple image sources are used.
    // -1 = not checked
    //  0 = no
    //  1 = yes
    this._hasmedia     = -1;

    // If non-zero the swipe threshold is in percentage of the screen width
    this._percentTouchThreshold = 0;

    this.wrapper = el.dataset.carouselWrapper;

    if (this.wrapper) {
      this.wrapper = h.closest(el, this.wrapper);
    }

    this.staticTextElem = h.getByClass(el, 'carousel-static-text', true);

    if (isTouch) {
      this.element.classList.add('carousel-is-touch');
    }

    let items = h.getByClass(this.slider, 'carousel-item');
    let pos = 0, tmp;

    h.each(items, el => {
      this.items.push(new Carousel.Item(el, pos++, this));
    });

    if (this.wrapper) {
      let addResize = false;
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].autoHeight) {
          addResize = true;
          break;
        }
      }

      if (addResize) {
        window.addEventListener(
          'resize',
          h.debounce(() => {
            this.setAutoHeight();
          }, 100),
          true
        );
      }
    }

    if (_ds.carouselDelay) {
      _cfg.delay = parseInt(_ds.carouselDelay, 10);
    }

    if (_ds.carouselTransition) {
      _cfg.transition = _ds.carouselTransition;
    }

    if (isTouch && _ds.carouselTouchThreshold) {
      tmp = _ds.carouselTouchThreshold;
      if (tmp[tmp.length - 1] === '%') {
        this._percentTouchThreshold = parseInt(tmp, 10);
        h.setPercentTouchThreshold(this._percentTouchThreshold, _cfg);
      }
      else {
        _cfg.touchthreshold = parseInt(tmp, 10);
      }
    }

    if (_ds.carouselRubberbandSwipe) {
      tmp = parseFloat(_ds.carouselRubberbandSwipe, 10);

      if (tmp > 1) {
        _cfg.swipeRubberBand = tmp;
      }
    }

    if (this.items.length) {
      this.items[0].load();
      this.items[0].activate();
    }

    if (this.items.length > 1) {
      this.items[1].load();
      this._makeIndicators();
    }

    if (isTouch) {
      this._setupTouchEvents();
    }

    if (this.items.length > 1) {
      this.play();
    }
  };

  /*
    Toggle add/remove the animate class on the slider
  */
  Carousel.prototype.sliderAnimate = function(on) {
    if (on) {
      this.slider.classList.add('animate');
    }
    else {
      this.slider.classList.remove('animate');
    }
  };

  Carousel.prototype.currentItem = function() {
    return this.items[this.currPos];
  };

  /*
    Start the auto play
  */
  Carousel.prototype.play = function() {
    if (this.ivalId) {
      clearTimeout(this.ivalId);
    }

    const my = this;

    this.ivalId = setTimeout(() => {
      my.next();
      my.play();
    }, this.config.delay);
  };

  /*
    Pause the auto play
  */
  Carousel.prototype.pause = function() {
    clearTimeout(this.ivalId);
    this.sliderAnimate(false);
  };

  /*
    Move to the next item
  */
  Carousel.prototype.next = function() {
    this.currPos += 1;
    if (this.currPos >= this.items.length) {
      this.currPos = 0;
    }

    this.goto(this.currPos);
  };

  /*
    Goto the item at @pos
  */
  Carousel.prototype.goto = function(pos) {
    if (pos < 0) {
      pos = this.items.length - 1;
    }
    else if (pos >= this.items.length) {
      pos = 0;
    }

    const next_prev = pos < this.currPos ? pos - 1 : pos + 1;

    clearTimeout(this.ivalId);

    this.sliderAnimate(true);
    this._loadIfNecessary(pos);
    this._loadIfNecessary(next_prev);
    this.setIndicator(pos);
    this.slider.dataset.carouselPos = pos;
    this.currPos = pos;
    this.items[pos].activate();
    this.play();
  };

  /*
    Check if any of the images in the items has multiple images for different
    device widths
  */
  Carousel.prototype.hasMediaQueries = function() {
    if (this._hasmedia !== -1) {
      return !!this._hasmedia;
    }

    h.each(this.items, item => {
      if (item.hasMediaQueries) {
        this._hasmedia = 1;
        return false;
      }
    });

    if (this._hasmedia === -1) {
      this._hasmedia = 0;
    }

    return !!this._hasmedia;
  };


  /*
    Media has changes, change images in the items if neccessary
  */
  Carousel.prototype.changeMedia = function(size) {
    if (this._percentTouchThreshold) {
      h.setPercentTouchThreshold(this._percentTouchThreshold, this.config);
    }

    h.each(this.items, item => {
      if (item.hasMediaQueries) {
        item.changeMedia(size);
      }
    });

    this.setAutoHeight();
  };


  /*
    Load the image in item @pos if it's not already loaded
  */
  Carousel.prototype._loadIfNecessary = function(pos) {
    if (pos >= 0 && pos < this.items.length) {
      if (!this.items[pos].isLoaded) {
        this.items[pos].load();
      }
    }
  };


  /*
    Setup touch events
  */
  Carousel.prototype._setupTouchEvents = function() {
    // Used to store the touch start/drag positions
    const x = {
      x: 0,
      y: 0,
      startX: 0
    };

    const _ = this;

    const getEvent = function(e) {
      return e.changedTouches[0];
    };

    const initStart = function(e) {
      x.x = e.clientX;
      x.y = e.clientY;
      x.startX = e.clientX;
    };

    const slider = this.slider;

    let abort = false;
    let touchendIval;

    slider.addEventListener('touchstart', e => {
      if (touchendIval) {
        clearTimeout(touchendIval);
      }
      const te = getEvent(e);
      initStart(te);
      this.element.classList.add('carousel-is-touchdrag');
      _.pause();
    }, false);

    slider.addEventListener('touchend', e => {
      touchendIval = setTimeout(() => {
        _.element.classList.remove('carousel-is-touchdrag');
      }, 1000);


      // The rotation has occured in touchmove so abort.
      if (abort) {
        abort = false;
        return;
      }

      const te = getEvent(e);
      let diff = te.clientX - x.x;

      if (Math.abs(diff) < _.config.touchthreshold) {
        _.sliderAnimate(true);
        requestAnimationFrame(() => {
          slider.style.removeProperty('left');
        });
      }

      _.play();

    }, false);

    slider.addEventListener('touchcancel', () => {
      _.element.classList.remove('carousel-is-touchdrag');
      slider.style.removeProperty('left');
      _.play();
    }, false);

    const touchMove = (e) => {
      const te        = getEvent(e);
      const diff      = te.clientX - x.x;
      const startDiff = te.clientX - x.startX;
      const left      = slider.offsetLeft;
      x.x = te.clientX;
      let nleft = left+(diff/(_.config.swipeRubberBand||1));

      if (Math.abs(startDiff) > _.config.touchthreshold) {
        e.preventDefault();
        abort = true;

        slider.style.removeProperty('left');
        slider.removeEventListener('touchmove', touchMove, false);

        if (diff > 0) {
          _._loadIfNecessary(_.currPos-1);
          _.goto(_.currPos-1);
        }
        else if (diff < 0) {
          _._loadIfNecessary(_.currPos+1);
          _.goto(_.currPos+1);
        }

        setTimeout(() => {
          initStart(te);
          setTouchMove();
        }, 600);

        return false;
      }

      slider.style.left = nleft + 'px';
    };

    const setTouchMove = () => {
      slider.addEventListener('touchmove', touchMove, false);
    };

    setTouchMove();
  };

  /*
    Create the indicators
  */
  Carousel.prototype._makeIndicators = function() {
    if (!this.useIndicators || this.items.length < 2) {
      return;
    }

    let ind = h.getByClass(this.element, 'carousel-indicators', true);
    const inds = [];

    if (!ind) {
      ind = h.mkel('div', { class: 'carousel-indicators' });
    }

    this.items.forEach(() => {
      const i = new Carousel.Indicator(this, inds.length);
      ind.appendChild(i.btn);
      inds.push(i);
    });

    inds[0].activate();

    this.element.appendChild(ind);
    this.indicators = inds;
  };

  /*
    Activate the indicator at position @index
  */
  Carousel.prototype.setIndicator = function(index) {
    if (!this.useIndicators || this.items.length < 2) {
      return;
    }

    if (index === undefined) {
      index = this.currPos;
    }

    this.currPos = index;

    this.indicators.forEach(ind => {
      ind.deActivate();
    });

    this.indicators[index].activate();
  };

  Carousel.prototype.setAutoHeight = function() {
    if (this.wrapper) {
      const ci = this.currentItem();

      if (ci.autoHeight) {
        const calcHeight = () => {
          const tmp = h.mkel('img', { src: ci.img.src, width: ci.img.width });
          tmp.style.visibility = 'hidden';
          tmp.style.position = 'absolute';
          document.body.appendChild(tmp);
          const height = tmp.height;
          document.body.removeChild(tmp);
          return height;
        };

        const wait = () => {
          if (ci.isLoaded) {
            const height = calcHeight();
            this.wrapper.classList.add('carousel-auto-height');
            this.wrapper.style.height = height + 'px';
            this.wrapper.style.minHeight = '0px';
          }
          else {
            requestAnimationFrame(wait);
          }
        };

        wait();
      }
      else  {
        this.wrapper.classList.remove('carousel-auto-height');
        this.wrapper.style.removeProperty('height');
        this.wrapper.style.removeProperty('min-height');
      }
    }
  };

  /*
    If defined and a function it will be called on eventual clicks.
    Return false to abort click.

    Carousel.clickBack = function(item) {
      // To something...
      return false;
    };
  */
  Carousel.clickBack = null;

  /*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
   |                                                                         |
   *                            Carousel.Item                                *
   |                                                                         |
   *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/

  Carousel.Item = function(el, pos, owner) {
    this.mediaQueries    = {};
    this.hasMediaQueries = false;
    this.img             = h.getByTag(el, 'img', true);
    this.element         = el;
    this.isLoaded        = false;
    this.src             = null;
    this.credit          = null;
    this.mediaSizes      = null;
    this.href            = el.dataset.carouselHref;
    this.position        = pos;
    this.hasImg          = this.img.length === undefined;
    this.carousel        = owner;
    this.keepImg         = el.dataset.carouselKeepImg !== undefined;
    this.autoHeight      = el.dataset.carouselAutoHeight !== undefined;
    this.creditElem      = h.mkel('div', { class: 'carousel-photo-credit ' +
                                                  'carousel-hidden' });

    if (this.keepImg) {
      this.element.classList.add('carousel-item-keep-img');
    }

    this.element.setAttribute('data-carousel-position', pos);
    this.element.appendChild(this.creditElem);

    if (this.href) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof Carousel.clickBack === 'function') {
          const res = Carousel.clickBack(this);
          if (res === false) {
            return;
          }
        }
        document.location.href = this.href;
      }, true);
    }

    if (this.hasImg) {
      this.defaultSrc = this.img.dataset.carouselSrc;
      this.defaultCred = this.img.dataset.carouselPhotoCredit;
      this._collectMediaSizes();

      const keys = Object.keys(this.mediaQueries).sort();
      let k;

      for (let i = 0; i < keys.length; i++) {
        k = keys[i];

        if (window.matchMedia(k).matches) {
          this.src = this.mediaQueries[k];
          if (typeof this.src === 'object') {
            this.credit = this.src.credit;
            this.src = this.src.img;
          }
        }
      }

      if (!this.src) {
        this.src = this.defaultSrc;
      }

      if (!this.credit) {
        this.credit = this.defaultCred;
      }

      if (!this.keepImg) {
        this.img.style.display = 'none';
      }
    }
  };

  Carousel.Item.prototype.activate = function() {
    this.carousel.setAutoHeight();

    const st = this.carousel.staticTextElem;
    if (st) {
      const cb = () => {
        document.location.href = this.href;
      };
      if (st._cb) {
        st.removeEventListener('click', st._cb);
      }
      if (this.href) {
        st.addEventListener('click', cb, false);
        st._cb = cb;
        st.style.cursor = 'pointer';
      }
      else {
        st.style.cursor = 'default';
      }
    }
  };

  /*
    Load the image matching the media size @size
  */
  Carousel.Item.prototype.changeMedia = function(size) {
    const src = this.mediaQueries[size] || this.defaultSrc;

    if (typeof src === 'object') {
      this.src = src.img || this.defaultSrc;
      this.credit = src.credit || this.defaultCred;
    }
    else {
      this.src = src;
      this.credit = this.defaultCred;
    }

    if (this.isLoaded) {
      this.load();
    }
  };


  /*
    Collect eventual multiple media size image sources
  */
  Carousel.Item.prototype._collectMediaSizes = function() {
    let m, sizes = [], sizesrc = {}, cred = {};

    for (let a in this.img.dataset){
      m = a.match(/(?:carousel)Mq-(\d+)$/);

      if (m) {
        this.hasMediaQueries = true;
        m = parseInt(m[1], 10);
        sizes.push(m);
        sizesrc[m] = this.img.dataset[a];
      }
      else {
        m = a.match(/(?:carouselPhotoCredit)Mq-(\d+)$/);
        if (m) {
          m = parseInt(m[1], 10);
          cred[m] = this.img.dataset[a];
        }
      }
    }

    let slen = sizes.length;

    if (slen) {
      let a, str, val;
      sizes.sort();

      for (let i = 0; i < slen; i++) {
        a   = sizes[i];
        str = `(min-width: ${a+1}px)`;

        if (i + 1 < sizes.length) {
          str = `(max-width: ${sizes[i+1]}px) and ` + str;
        }

        val = sizesrc[a];

        if (cred[a]) {
          val = { img: val, credit: cred[a] };
        }

        this.mediaQueries[str] = val;
        h.addMediaQuery(str);
      }

      this.mediaSizes = sizes;
    }
  };

  /*
    Load the current image source.
  */
  Carousel.Item.prototype.load = function() {
    if (this.hasImg) {
      this._setSrc(this.src);
    }
  };

  /*
    Set the src attribute to @src and add it as background image on the
    item when the image is loaded.
  */
  Carousel.Item.prototype._setSrc = function(src) {
    if (this.hasImg) {
      this.isLoaded = false;
      let imgsrc = src;

      if (typeof src === 'object') {
        imgsrc = src.img;
      }

      this.img.setAttribute('src', imgsrc);
      this.img.onload = () => {
        if (!this.keepImg) {
          this.element.style.backgroundImage = `url(${imgsrc})`;
        }
        this.isLoaded = true;
      };

      if (this.credit) {
        this.creditElem.textContent = this.credit;
        this.creditElem.classList.remove('carousel-hidden');
      }
      else {
        this.creditElem.textContent = '';
        this.creditElem.classList.add('carousel-hidden');
      }
    }
  };

  /*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
   |                                                                         |
   *                          Carousel.Indicator                             *
   |                                                                         |
   *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/

  Carousel.Indicator = function(owner, index) {
    const _ = this;
    this.index = index;
    this.owner = owner;
    this.btn = h.mkel('a', { class: 'carousel-indicator',
                             href: '#carousel-' + index });
    this.btn.appendChild(h.mkel('span', { class: 'carousel-indicator-inner' }));
    this.btn.addEventListener('click', (e) => {
      e.preventDefault();
      _.owner.goto(_.index);
      return false;
    }, true);
  };

  /*
    Activate this indicator
  */
  Carousel.Indicator.prototype.activate = function() {
    this.btn.classList.add('carousel-indicator-active');
  };

  /*
    Deactivate this indicator
  */
  Carousel.Indicator.prototype.deActivate = function() {
    this.btn.classList.remove('carousel-indicator-active');
  };

  window.addEventListener('DOMContentLoaded', () => {
    const cs = h.getByClass(document, 'carousel');

    if (cs && cs.length) {
      h.each(cs, el => {
        new Carousel(el);
      });
    }
  });

  Carousel.carousels = carousels;
  window.Carousel = Carousel;

}(window, document, window.navigator));
