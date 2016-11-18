# Carousel.JS
A simple Javascript carousel with no library dependency and lazy image loading.

This is not a fancy pancy full fledged carousel in any way, and that will never
be the purpose or goal either. If that's what you want then check out [Slick](http://kenwheeler.github.io/slick/) instead.

## Example

```
<div class="my-carousel-wrapper">
  <!-- Milliseconds between item rotations -->
  <div class="carousel" data-carousel-delay="8000" data-carousel-indicators="">
    <div class="carousel-slider">
      <!-- Begin item -->
      <div class="carousel-item">
        <div class="carousel-item-text">
          <h2>Arbitrary...</h2>
          <p>...text goes here...</p>
        </div>
        <img src="empty-pixel.png"  alt="..."
             data-carousel-src="path/to/image.jpg"
             data-carousel-mq-768="path/to/tablet-image.jpg"
             data-carousel-mq-414="path/to/mobile-image.jpg">
      </div>

      <!-- Begin item -->
      <div class="carousel-item">
        <div class="carousel-item-text">
          <h2>Arbitrary...</h2>
          <p>...text goes here...</p>
        </div>
        <img src="empty-pixel.png" alt="..."
             data-carousel-src="path/to/image-2.jpg"
             data-carousel-mq-768="path/to/tablet-image-2.jpg"
             data-carousel-mq-414="path/to/mobile-image-2.jpg">
      </div>
    </div>
  </div>
</div>
```

**NOTE!** This is just in its infant state and is in no way completed yet!
