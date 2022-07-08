# Flower of Life animated banner

This banner allows you to transition between images using a rule image for the wipe animation.

I have provided a sample rule image in this package:

![IMAGE](https://github.com/Motekye/Flower/blob/main/fol.png?raw=true)

This will tile a flower of life pattern as the wipe animation. Use any tiling image you want. It doesn't need to be greyscale, but will be interpereted as greyscale for the purposes of the wipe animation. So Making the image greyscale will give you a better indication of how the wipe will look.

### Step One: Provide Base64 images

Provide any number of images to switch between and one image for the rule.
The images must be base64 encoded. Here's a sample PHP file to create the images needed...

    <?php
    
    header("Content-type: text/javascript\r\n");
    
    echo 'FLOWER.img64.push("data:image/jpeg;base64,'.base64_encode(file_get_contents('images/1.jpg')).'");';
    echo 'FLOWER.img64.push("data:image/jpeg;base64,'.base64_encode(file_get_contents('images/2.jpg')).'");';
    echo 'FLOWER.img64.push("data:image/jpeg;base64,'.base64_encode(file_get_contents('images/3.jpg')).'");';
    echo 'FLOWER.img64.push("data:image/jpeg;base64,'.base64_encode(file_get_contents('images/4.jpg')).'");';
    echo 'FLOWER.img64.push("data:image/jpeg;base64,'.base64_encode(file_get_contents('images/5.jpg')).'");';
    
    echo 'FLOWER.rule64 = "data:image/png;base64,'.base64_encode(file_get_contents('images/rule.png')).'";';

The images you use should all be the same size.
The rule image can be any size, it will be *tiled over* the images you switch between.

### Step Two: Include flower.js and the PHP script

Once that file is created, let's call it **flower-img.php**, include the **flower.js** from this package,
then include the PHP file you created in the &lt;head> of your HTML document...

    <script type="text/javascript" src="/path/to/flower.js"></script>
    <script type="text/javascript" src="/path/to/flower-img.php"></script>

### Step Three: create the #flower element on your page

    <div id="flower"></div>

Use CSS to size and position this element however you want. The script will automatically scan the size of it and create all necessary support elements. Generally, the element should be the same size as your images, or at least the same aspect ratio.

### Step Four: Create triggers for the animation

Now we have to trigger the animation somehow. You can trigger the animation however you want in javascript using the **FLOWER.to()** method.

Here's some sample links to navigate between five images.

    <ul>
      <li><a onclick="FLOWER.to(0);">1</a></li>
      <li><a onclick="FLOWER.to(1);">2</a></li>
      <li><a onclick="FLOWER.to(2);">3</a></li>
      <li><a onclick="FLOWER.to(3);">4</a></li>
      <li><a onclick="FLOWER.to(4);">5</a></li>
    </ul>

Note that the images selected are 0-based.

### Step five: The FLOWER.ready() callback

This step is optional. You can define a function which gets called after the animation, when FLOWER is ready to animate again. If you try to run **FLOWER.to()** while an animation is in progress, the call will be ignored. So you can use this callback to indicate that FLOWER is ready for the next animation.

    <script type="text/javascript">
      FLOWER.ready = function(){
        // do something...
      }
    </script>

## Fine Tuning

FLOWER has a few properties you can change to alter aspects of the animation. These are their default values...

    FLOWER.frames = 15;   // total number of frames
    FLOWER.rate = 60;     // ms between each frame

Multiply these two numbers to get the total milliseconds of the animation.
