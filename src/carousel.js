/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>

  Permission to copy, modify, and distribute this source for any legal
  purpose granted as long as my name is still attached to it. More
  specifically, the GPL, LGPL and MPL licenses apply to this software.
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
      // window.console.log('Image loaded');
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
    else if (this.currPos + 1 < this.items.length)  {
      if (!this.items[this.currPos+1].isLoaded) {
        this.items[this.currPos+1].load();
      }
    }

    this.slider.dataset.carouselPos = this.currPos;
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
