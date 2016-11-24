# Carousel.JS
<!-- catch -->
A simple Javascript carousel with no library dependencies, with lazy image loading and support for multiple image sources for the same item depending on device size.

This is not a fancy pancy full fledged carousel in any way, and that will never
be the purpose or goal either. If that's what you want then check out [Slick](http://kenwheeler.github.io/slick/) instead.

## Howto

The size of the carousel is determined by the size of its outer container.
<!-- endcatch -->
<!-- catch(table)-->

| Element/CSS class   | Attribute                  | Description | Example |
| ------------------- | -------------------------- | ----------- | ------- |
| `carousel`          | `data-carousel-delay`      | Delay in milliseconds between rotations | 8000 |
|       ...           | `data-carousel-indicators` | Add indicators | No value |
|       ...           | `data-carousel-touch-threshold` | x distance to start transition on swipes | 100 |
| `carousel-item`     | `data-carousel-href`       | Make the item clickable | http://pike.lysator.liu.se |
| `<img>`             | `data-carousel-src`        | Source of default image | `/img/image-1.jpg` |
|       ...           | `data-carousel-mq-(n)`     | Alternative image source. **`(n)`** is a breakpoint for when the alternative image should be shown. | `data-carousel-mq-414='tablet-image.jpg'` |

<!-- endcatch -->

## Example/Boilerplate

```html
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
             data-carousel-src="path/to/mobile-image.jpg"
             data-carousel-mq-768="path/to/desktop-image.jpg"
             data-carousel-mq-414="path/to/tablet-image.jpg">
      </div>

      <!-- Begin item -->
      <div class="carousel-item">
        <div class="carousel-item-text">
          <h2>Arbitrary...</h2>
          <p>...text goes here...</p>
        </div>
        <img src="empty-pixel.png" alt="..."
             data-carousel-src="path/to/mobile-image-2.jpg"
             data-carousel-mq-768="path/to/desktop-image-2.jpg"
             data-carousel-mq-414="path/to/tablet-image-2.jpg">
      </div>
    </div>
  </div>
</div>
```
