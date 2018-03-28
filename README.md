# Carousel.JS
<!-- catch -->
A simple Javascript carousel with no library dependencies, with lazy image loading and support for multiple image sources for the same item depending on device size.

This is not a fancy pancy full fledged carousel in any way, and that will never
be the purpose or goal either. If that's what you want then check out [Slick](http://kenwheeler.github.io/slick/) instead.
<!-- endcatch -->

For real examples check out the [Carousel.JS](https://poppa.github.io/carousel-js/)
web page.

<!-- catch -->
---

## Howto

The size of the carousel is determined by the size of its outer container. This means
that the carousel wrapper must have a given height in some way.

---

<!-- endcatch -->
<!-- catch(table)-->

### Carousel wrapper

The outer most `div` element of the carousel that contain all carousel content

```html
<div class="carousel"
     data-carousel-delay="8000"
     data-carousel-indicators=""
     data-carousel-touch-threshold="40%"
     data-carousel-rubberband-swipe="1.5">
```

| Attribute                        | Description                                  | Example  |
| -------------------------------- | -------------------------------------------- | -------- |
| `data-carousel-delay`            | Delay in milliseconds between rotations      | 10000    |
| `data-carousel-indicators`       | Add indicators                               | No value |
| `data-carousel-touch-threshold`  | x distance to swipe before transition starts. Can be either a fixed number (px) or in percent (%) | 100 or 50%      |
| `data-carousel-rubberband-swipe` | Give a rubber band effect when swipeing.     | 1.5      |
| `data-carousel-wrapper`          | CSS selector for the outer wrapper. Only used when `data-carousel-keep-img` and `data-carousel-auto-height` are used | .outer-wrapper |
---

### Carousel slider

This is the first child of the **Carousel wrapper**. This element takes no data attributes

```html
<div class="carousel-slider">
```

---

### Carousel item

This container is the wrapper for every item in the carousel.

```html
<div class="carousel-item"
     data-carousel-href="http://domain.com/path/">
```

| Attribute                       | Description                                  | Example        |
| ------------------------------- | -------------------------------------------- | -------------- |
| `data-carousel-href`            | URL to goto when the item is clicked         | /internal/path |
| `data-carousel-keep-img`        | Don't put the image as background, show the `<img>` tag instead | "(empty)" |
| `data-carousel-auto-height`     | Only used when `data-carousel-keep-img` is set. Will auto-adjust the wrapper height accorning to the height of the `<img>`. This requires that `data-carousel-wrapper` is set on the **Carsousel wrapper** |

---

### Carousel item text

This container can contain any html.

```html
<div class="carousel-item-text">
```

---

### Carousel item image

The image tag uses lazy loading so the best thing to do is to set the `src`
attribute to point to an empty pixel image or something like that and use
the `carousel-*` attributes for the real image sources. The `img` tag has support
for arbitrary number of sources for different devices (or strictly speaking
media width directives).

The `img` tag will not be displayed per se, but the `src` will rather be placed
as a background image on the `carousel-item` element. But the `img` will only be
visibly hidden and still be accessible for screen readers for which, for
instance, the `alt` attribute will serve a purpose.

If the media directive attributes are used the priciple of mobile first is applied,
so give the mobile version as value to the `data-carousel-src` attribute, which is
the default source attribute.

```html
<img src="empty/pixel.png" alt="Image description"
     data-carousel-src="real-image.jpg"
     data-carousel-mq-414="real-tablet-image.jpg"
     data-carousel-mq-768="real-desktop-image.jpg">
```

| Attribute                       | Description                                  | Example          |
| ------------------------------- | -------------------------------------------- | ---------------- |
| `data-carousel-src`             | Default image src                            | /images/img1.jpg |
| `data-carousel-mq-(n)`          | Alternative image sources. `(n)` is an arbitrary number which will be set to the media directive `@media (min-width: (n)px)`                            | `data-carousel-mq-376='larger-than-iphone6-image.jpg'` |
| `data-carousel-photo-credit`    | Show photo credit                            | Robert Capa      |
| `data-carousel-photo-credit-mq-(n)` | Like `data-carousel-mq-(n)` above but for the photo credit. This is only needed if multiple sources are used and `(n)` should then match `(n)` of `data-carousel-mq-(n)` | Another Photographer |

### The `Carousel` global object

This object has one static property (`null` by default) that if set with a
function that function will be called when a slider item is clicked (if the
`data-carousel-href` attribute is used on the item).

```js
Carousel.clickBack = function(item) {
  // Check something....
  // Return false if you want to abort the click
  // For instance:
  if (item.href.indexOf('http:') > -1) {
    window.top.location.href = item.href;
    return false;
  }
}
```

<!-- endcatch -->

See the example below for a full implementation

## Example/Boilerplate

```html
<div class="my-carousel-wrapper">
  <!--
    8 seconds between item rotations
    100 pixels horizontal swipe threshold to execute the rotation
    Show indicators
  -->
  <div class="carousel"
       data-carousel-delay="8000"
       data-carousel-touch-threshold="100"
       data-carousel-indicators="">
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
