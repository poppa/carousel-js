/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>
*/
// jshint esversion: 6

(function(window) {
  'use strict';

  const werror = window.console.log;

  const h = (function() {
    return {
      getByClass: function(el, cls, one) {
        const e = el.getElementsByClassName(cls);
        if (one && e.length) {
          return e[0];
        }

        if (!e.length) {
          return undefined;
        }

        return e;
      },

      getByTag: function(el, tag, one) {
        const e = el.getElementsByTagName(tag);
        if (one) {
          if (e && e.length) {
            return e[0];
          }
        }
        return e;
      },

      mkel: function(tag, attr) {
        var e = document.createElement(tag);

        if (attr) {
          for (const k of Object.keys(attr)) {
            e.setAttribute(k, attr[k]);
          }
        }

        return e;
      }
    };
  }());

  const Carousel = function(el) {
    this.config = {
      delay: 8000,
      transition: 'slide'
    };

    this.element    = el;
    this.useIndicators = el.dataset.carouselIndicators !== undefined;
    this.indicators = [];
    this.slider     = h.getByClass(el, 'carousel-slider', true);
    this.items      = [];
    this.ivalId     = null;
    this.currPos    = 0;

    // werror('Use indicators: ', this.useIndicators);

    let items = h.getByClass(this.slider, 'carousel-item');

    for (let i of items) {
      this.items.push(new Carousel.Item(i));
    }

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

    this.play();
  };

  Carousel.Item = function(el) {
    this.img      = h.getByTag(el, 'img', true);
    this.element  = el;
    this.isLoaded = false;
    this.src      = this.img.dataset.carouselSrc;

    this.img.style.display = 'none';
  };

  Carousel.Item.prototype.load = function() {
    const my = this;

    this.img.setAttribute('src', this.src);
    this.img.onload = e => {
      my.element.style.backgroundImage = 'url(' + my.src + ')';
      my.isLoaded = true;
    };
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
    werror('gotot: ', pos);
    if (pos < 0 || pos >= this.items.length) {
      return;
    }

    clearTimeout(this.ivalId);

    this._loadIfNecessary(pos);
    this.setIndicator(pos);
    this.slider.dataset.carouselPos = pos;
    this.currPos = pos;
    this.play();
  };

  Carousel.prototype._loadIfNecessary = function(pos) {
    if (pos >= 0 && pos < this.items.length) {
      if (!this.items[pos].isLoaded) {
        this.items[pos].load();
      }
    }
  };


  Carousel.prototype._makeIndicators = function() {
    if (!this.useIndicators || this.items.length < 2) {
      return;
    }

    let ind = h.getByClass(this.element, 'carousel-indicators', true);
    const inds = [];

    if (!ind) {
      ind = h.mkel('div', { class: 'carousel-indicators' });
      werror('Ind: ', ind);
    }

    this.items.forEach(el => {
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
      werror('No indicators', this.useIndicators, this.items.length);
      return;
    }

    // werror('Set indicator: ', index);

    if (index === undefined) {
      index = this.currPos;
    }

    this.currPos = index;

    this.indicators.forEach(ind => {
      ind.deActivate();
    });

    this.indicators[index].activate();
  };

  Carousel.Indicator = function(owner, index) {
    const _ = this;
    this.index = index;
    this.owner = owner;
    this.btn = h.mkel('a', { class: 'carousel-indicator'});
    this.btn.appendChild(h.mkel('span', { class: 'carousel-indicator-inner' }));
    this.btn.addEventListener('click', e => {
      _.owner.goto(_.index);
    }, true);
  };

  Carousel.Indicator.prototype.activate = function() {
    this.btn.classList.add('carousel-indicator-active');
  };

  Carousel.Indicator.prototype.deActivate = function() {
    this.btn.classList.remove('carousel-indicator-active');
  };


  window.addEventListener('DOMContentLoaded', (e) => {
    const cs = document.getElementsByClassName('carousel');

    if (cs.length) {
      for (let el of cs) {
        new Carousel(el);
      }
    }
  });

}(window));
