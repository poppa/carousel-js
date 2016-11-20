/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>
*/

// jshint esversion: 6, undef: true, unused: true
/* global window, document, setTimeout, clearTimeout */


(function(window, document, navigator) {
  'use strict';

  // Storage for all created carousels.
  const carousels = [];

  // Storage for match media sizes.
  const mediaQueries = {};

  // When we get a media match we don't act upon in immediately but only
  // execute on the last one. This is the interval ids for matches and no
  // matches. The latter is needed if no media is matched, in which case we
  // need to set the default media.
  let mmcival, nomatchival;
  const onMatchMediaChange = function(e) {
    if (e.matches) {
      // werror('>>> Media change: ', e.media);
      h.each(carousels, c => {
        if (c.hasMediaQueries()) {
          if (mmcival) {
            clearTimeout(mmcival);
          }

          if (nomatchival) {
            clearTimeout(nomatchival);
          }

          mmcival = setTimeout(() => {
            c.changeMedia(e.media);
            mmcival = null;
            nomatchival = null;
          }, 10);
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
      }, 10);
    }
  };

  const werror = window.console.log;

  const isTouch = (('ontouchstart' in window)       ||
                   (navigator.maxTouchPoints   > 0) ||
                   (navigator.msMaxTouchPoints > 0));

  // werror('Is touch: ', isTouch);

  // Helper methods
  const h = (function() {
    return {
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
      }
    };
  }());

  if (isTouch) {
    h.getByTag(document, 'html', true).classList.add('carousel-istouch');
  }

  const Carousel = function(el) {
    this.config = {
      delay: 8000,
      transition: 'slide',
      touchthreshold: 40
    };

    carousels.push(this);

    this.element       = el;
    this.useIndicators = el.dataset.carouselIndicators !== undefined;
    this.indicators    = [];
    this.slider        = h.getByClass(el, 'carousel-slider', true);
    this.items         = [];
    this.ivalId        = null;
    this.currPos       = 0;

    this._hasmedia     = -1;

    let items = h.getByClass(this.slider, 'carousel-item');

    let pos = 0;
    h.each(items, el => {
      this.items.push(new Carousel.Item(el, pos++));
    });

    if (el.dataset.carouselDelay) {
      this.config.delay = parseInt(el.dataset.carouselDelay, 10);
    }

    if (el.dataset.carouselTransition) {
      this.config.transition = el.dataset.carouselTransition;
    }

    if (this.items.length) {
      this.items[0].load();
    }

    if (this.items.length > 1) {
      this.items[1].load();
      this._makeIndicators();
    }

    if (isTouch) {
      this._setupTouchEvents();
    }

    this.play();
  };


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

  Carousel.prototype.pause = function() {
    clearTimeout(this.ivalId);
  };

  Carousel.prototype.next = function() {
    this.currPos += 1;

    if (this.currPos >= this.items.length) {
      this.currPos = 0;
    }
    else {
      this._loadIfNecessary(this.currPos+1);
    }

    this.goto(this.currPos);
  };

  Carousel.prototype.goto = function(pos) {
    // if (pos < 0 || pos >= this.items.length) {
    //   return;
    // }

    if (pos < 0) {
      pos = this.items.length - 1;
    }
    else if (pos >= this.items.length) {
      pos = 0;
    }

    clearTimeout(this.ivalId);

    this._loadIfNecessary(pos);
    this.setIndicator(pos);
    this.slider.dataset.carouselPos = pos;
    this.currPos = pos;
    this.play();
  };

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

  Carousel.prototype.changeMedia = function(size) {
    // werror('Carousel.changeMedia(', size, ')');
    h.each(this.items, item => {
      if (item.hasMediaQueries) {
        item.changeMedia(size);
      }
    });
  };

  Carousel.prototype._loadIfNecessary = function(pos) {
    if (pos >= 0 && pos < this.items.length) {
      if (!this.items[pos].isLoaded) {
        this.items[pos].load();
      }
    }
  };


  Carousel.prototype._setupTouchEvents = function() {
    const x = {
      x: 0,
      y: 0
    };

    const _ = this;

    const getEvent = function(e) {
      return e.changedTouches[0];
    };

    const slider = this.slider;

    let abort = false;

    slider.addEventListener('touchstart', e => {
      const te = getEvent(e);
      x.x = te.clientX;
      x.y = te.clientY;
      _.pause();
    }, false);

    slider.addEventListener('touchend', e => {
      if (abort) {
        abort = false;
        return;
      }

      const te = getEvent(e);
      let next;
      let diff = te.clientX - x.x;

      if (Math.abs(diff) < _.config.touchthreshold) {
        slider.style.removeProperty('left');
        return;
      }

      if (te.clientX < x.x) {
        next = _.currPos + 1;
        if (next >= _.items.length) {
          next = 0;
        }
      }
      else if (te.clientX > x.x) {
        next = _.currPos - 1;
        if (next < 0) {
          next = _.items.length - 1;
        }
      }

      if (next !== undefined) {
        slider.style.removeProperty('left');
        _.goto(next);
      }
      else {
        _.play();
      }
    }, false);

    slider.addEventListener('touchcancel', () => {
      // werror('Touch cancel..');
      slider.style.removeProperty('left');
      _.goto(_.currPos);
    }, false);

    const touchMove = (e) => {
      const te   = getEvent(e);
      const diff = te.clientX - x.x;
      const left = slider.offsetLeft;

      if (Math.abs(diff) > _.config.touchthreshold) {
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
          setTouchMove();
        }, 600);


        return false;
      }

      // werror('Move: ', diff);

      slider.style.left = Math.round(left + diff) + 'px';
    };

    const setTouchMove = () => {
      slider.addEventListener('touchmove', touchMove, false);
    };

    setTouchMove();
  };

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


  Carousel.Item = function(el, pos) {
    this.mediaQueries    = {};
    this.hasMediaQueries = false;
    this.img             = h.getByTag(el, 'img', true);
    this.element         = el;
    this.isLoaded        = false;
    this.src             = null;
    this.defaultSrc      = this.img.dataset.carouselSrc;
    this.mediaSizes      = null;
    this.href            = el.dataset.carouselHref;
    this.position        = pos;

    this.element.setAttribute('data-carousel-position', pos);

    if (this.href) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        document.location.href = this.href;
      }, true);
    }

    this._collectMediaSizes();

    const keys = Object.keys(this.mediaQueries).sort();
    let k;

    for (let i = 0; i < keys.length; i++) {
      k = keys[i];

      if (window.matchMedia(k).matches) {
        this.src = this.mediaQueries[k];
      }
    }

    if (!this.src) {
      this.src = this.img.dataset.carouselSrc;
    }

    this.img.style.display = 'none';
  };

  Carousel.Item.prototype.changeMedia = function(size) {
    const src = this.mediaQueries[size];
    this.src = src || this.defaultSrc;

    if (this.isLoaded) {
      this.load();
    }
  };

  Carousel.Item.prototype._collectMediaSizes = function() {
    let m, sizes = [], sizesrc = {};

    for (let a in this.img.dataset){
      m = a.match(/Mq-(\d+)$/);

      if (m) {
        this.hasMediaQueries = true;
        m = parseInt(m[1]);
        sizes.push(m);
        sizesrc[m] = this.img.dataset[a];
      }
    }

    let slen = sizes.length;

    if (slen) {
      let a, str;
      sizes.sort();

      for (let i = 0; i < slen; i++) {
        a   = sizes[i];
        str = `(min-width: ${a+1}px)`;

        this.mediaQueries[str] = sizesrc[a];
        h.addMediaQuery(str);
      }

      this.mediaSizes = sizes;
    }
  };

  Carousel.Item.prototype.load = function() {
    this._setSrc(this.src);
  };

  Carousel.Item.prototype._setSrc = function(src) {
    this.img.setAttribute('src', src);
    this.img.onload = () => {
      this.element.style.backgroundImage = `url(${src})`;
      this.isLoaded = true;
    };
  };


  Carousel.Indicator = function(owner, index) {
    const _ = this;
    this.index = index;
    this.owner = owner;
    this.btn = h.mkel('a', { class: 'carousel-indicator', href: '#carousel-' + index });
    this.btn.appendChild(h.mkel('span', { class: 'carousel-indicator-inner' }));
    this.btn.addEventListener('click', (e) => {
      e.preventDefault();
      _.owner.goto(_.index);
      return false;
    }, true);
  };

  Carousel.Indicator.prototype.activate = function() {
    this.btn.classList.add('carousel-indicator-active');
  };

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

}(window, document, window.navigator));
