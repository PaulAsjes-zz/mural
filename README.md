# Mural

Customisable tiled presentation jQuery plugin. Items will automatically realign to appropriate columns based on browser size. Drag and drop to change order.

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/PaulAsjes/mural/master/dist/jquery.mural.min.js
[max]: https://raw.github.com/PaulAsjes/mural/master/dist/jquery.mural.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.mural.min.js"></script>
<script>
jQuery(function($) {
  $("#container").mural({
  	// options...
  	itemSelector: ".mural-item",
  	speed: 250
  });
});
</script>
```

## Documentation

# Options
| Setting | Type | Default value | Description |
| --- | --- | --- | --- |
| itemSelector | `String` | `""` | Class selector, identify which HTML elements Mural should effect. |
| speed | `Number` | `500` | Speed at which animations progress in milliseconds. |
| wgap | `Number` | `50` | Horizontal gap between items in pixels. |
| hgap | `Number` | `50` | Vertical gap between items in pixels. |
| maxColumns | `Number` | `infinity` | Maximum amount of columns Mural will render. |
| minColumns | `Number` | `1` | Minimum amount of columns Mural will render. |
| onReshuffle | `Function` | `noop` |Callback function when items have reshuffled. Returns the list of HTML elements in the order displayed on screen. See the examples for more information. |
| animationType | `String` | `"auto"` | Which animation library to use. Options include `"jquery"` for the standard jQuery animation library, `"css"` for CSS3 transitions and `"velocity"` for the Velocity animation library. Default is `"auto"` which attempts to automatically select the animation type dependant on available libraries. Mural will gracefully degrade to using jQuery if either Velocity or CSS is specified yet unavailable. |
| centered | `Boolean` | `true` | Whether the items will be rendered in the centre of the parent div. |
| activeCSS | `String` | `""` | CSS class to be assigned to the items when dragging. Useful if you want some effects like box shadowing when item is active. |
| order | `Object` | `null` | Custom order of the items. use `onReshuffle` to save the item list and `order` to display the items in the desired way. See the examples on usage. |
| draggable | `Boolean` | `true` | Whether the item can be dragged and dropped or not. |

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
