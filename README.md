# fitgrid

Framework for responsive pages or page elememts that zoom in or out with the space available to them. Like CSS column frameworks this means that columns shrink and grow. Additionally, items grow taller and shorter and fonts increase and decrease in size. The end result is a completely "zoom-able" element capable of resizing to fit exactly to any space you give it.

jQuery is required. The library is ideal for a tablet, phone or desktop applications. The large load required for the initial render makes fitgrid.js more suitable for apps than for websites.

## Basic usage

The following will apply the fitgrid rules to the targeted element:

    $('#pane').fitgrid();
    
## Re-rendering the fitgrid

The fitgrid will automatically adjust if the area containing it is resized. So if a div size is adjusted, or if your fitgrid is full-page and the page is resized, the fitgrid will adjust automatically.

Whenever you modify the "fg" elements within your fitgrid, however, you need to call the following to trigger the rendering process. This triggers rendering for all fitgrids on the page:

window.run_all_fitgrids();    

## Fitgrid CSS classes

Example fitgrid HTML. This creates a 2x4 box with 2 spaces of clearance to the left and one above. The font inside the box will be size 10:

    <div class="fg 2x4 font10 left_space_2 top_space_1">Hello</div>

### fg - the core class

Fitgrid will maniuplate every element with a class of "fg" and ignore every other element. By default any element with class "fg" will:

1. display:block
2. float:left
3. overflow:hidden
4. have its content centered horizontally and vertically
5. have its dimensions resized according to the size of the screen and the grid blocks it should occupy
6. have a gutter on the right-hand side and underneath

Example, this is a 1x1 fitgrid block:

    <div class="fg 1x1">Content Here</div> 

### Size - 2x2

Specify the size of each block with a class that specifies horizontal width x height. Sizes can be fractions.

Examples:

    <div class="fg 5x1">Hello</div>
    <div class="fg 4x.5">Shorter block</div>

### font - font10

Specify the font size inside a block with a class of "font" followed by the font size. Since everything resizes when you change the screen size, the font sizes are relative. Font sizes are inherited--an outer block with font16 will change inner blocks to font16 unless they specify something else. Fonts can be fractions.

Examples:

    <div class="fg 6x1 font6">Small text</div>
    <div class="fg 6x2 font18">Large text</div>

### Horizontal gutter on/off - x_gutter_off

To turn off the gutter on the right-hand size of an "fg" block, specify "x_gutter_off". You can also specify "x_gutter_on" for situations where you have more than one set of dimensions you are dealing with.

Example:
    
    <div class="fg 1x1 x_gutter_off">No gutter on the right side here</div>

### Vertical gutter on/off - y_gutter_off

Turn off the gutter that comes below each block by default by specifying "y_gutter_off". You can also specify "y_gutter_on".

Example:

    <div class="fg 1x1 y_gutter_off">No gutter below here</div>

### Space on left - left_space_X

Add space to the left of an fg element with left_space_x. X is a space, counted in # of blocks, to add to the left of your element. Space sizes can be fractions.

    <div class="fg 1x1 left_space_4">four spaces on the left</div>
    <div class="fg 1x1 left_space_.5">half a space</div>

### Space above - top_space_x

Add space above an fg element with "top_space_x". X is a space, counted in # of blocks, to add above your element. Space sizes can be fractions.

    <div class="fg 1x1 top_space_3">three spaces on top</div>
    <a class="fg 2x2 top_space_.5">half a space above</div>

### Start a new line - newline

Start a new line with "newline". This begins puts your "fg" block on the next line. You can call for a new line with "newline" or "newline_on", or cancel the newline with "newline_off".

    <div class="fg 2x1">This is above</div>
    <div class="fg 2x1 newline">This is above</div>

### Turn off vertical centering - vertical_center_off

Vertical centering for the content of all "fg" elements is turned on by default. Turn it off with "vertical_center_off", or turn it back on again with "vertical_center_on".

    <div class="fg 2x2 vertical_center_off">This text will be a the top</div>

### Overflow - left_overflow_on and right_overflow_on

You can turn off the x_gutter if you like with "x_gutter_off", or you can "overflow" it, meaning have your element cover half of it. If you put an element with "overflow_right_on" to the left of an element with "overflow_left_on" you would have two joining elements that cover the gutter between them, like so:

    <div class="fg 2x1 overflow_right_on" style="background-color:#ccc;">left side</div>
    <div class="fg 2x1 overflow_left_on" style="background-color:#efefef;">right side--joined ot the left</div>


### Turn off visibility - visible_off

Make an element invisible by adding a class of "visible_off", or make it visible with "visable_on".

    <div class="fg 2x2 visible_off">hidden for now</div>

### Zoom - zoom

Zoom modifies the size and font size of all fg elements within a zoomed element. A zoom of 2 makes everything twice as big, so that you can fit 5 elements into a space that would normally hold ten. The gutter size is not affected.

    <div class="fg zoom2">
      <div class="fg 2x1 font15">Big text here</div>
    </div>


## Fitgrid options

Pass any of these options when you instantiate a new fitgrid, like so:

    $('.block').fitgrid({
      default_font: 10,
      post_render:function(theDiv) {
        console.log('just rendered this div:');
        console.log(theDiv);
      }
    });

### Defaults and data

* `base_width_units` - the number of horizontal units in the grid (default is 12)
* `base_height_units` - the number of vertical units in the grid (default is 10)
* `default_font` - the default "font" declaration (default is 12)
* `gutter_percentage` - the size of the gutters (default is .1)
* `minimum_height_ratio` - When height is divided by width for the entire grid, this is the highest the result can be. This prevents your display from getting stretched oddly on very tall displays. (default is .8)
* `maximum_height_ratio` - When height is divided by width for your entire grid, this is lowest the result can be. This prevents your display from stretching to far wide. (default is 1.14)
* `show_gutter` - show the gutters or not (default is true)
* `vertical_center` - vertically center contents (default is true)

### Callbacks

These callbacks are available to be called whenever a fitgrid is rendered. The sole argument for each of these is the element that is the target of this plugin.

* `pre_calculations` - callback that takes place whenever the pane is going to render, prior to calculations being made. 
* `post_calculations` - callback that takes place just after the calculations are made and before rendering.
* `pre_render` - called just before the rendering takes place. 
* `post_rdner` - called just after rendering completes. 

# Please note

* Any padding that you apply to the elmement you are targeting will be removed by "fitgrid". Fitgrid uses the padding to center the contents.
