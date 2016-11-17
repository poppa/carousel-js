/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>
*/
// jshint esversion: 6

(function(window) {
  'use strict';

  const Carousel = function(el) {
    this.config = {
      delay: 8000,
      transition: 'slide'
    };

    this.slider  = el.getElementsByClassName('carousel-slider')[0];
    this.items   = [];
    this.ivalId  = null;
    this.currPos = 0;

    let items = this.slider.getElementsByClassName('carousel-item');

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
    }

    this.play();
  };

  Carousel.Item = function(el) {
    this.img      = el.getElementsByTagName('img')[0];
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
      clearInterval(this.ivalId);
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

    this.slider.dataset.carouselPos = this.currPos;
  };

  Carousel.prototype._loadIfNecessary = function(pos) {
    if (pos >= 0 && pos < this.items.length) {
      if (!this.items[pos].isLoaded) {
        this.items[pos].load();
      }
    }
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
