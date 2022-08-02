# js13kBreakout with Goodluck

This project is based on [Goodluck](https://gdlck.com), a hackable template for creating small and fast browser games. Goodluck is a bit unusual in that it's not a typical library; you don't import code from it to use in your project. Instead, Goodluck is a repository template — generate a new repository from it, remove the code you don't need, and hack away.

## Live Demo

* https://breakouts.js13kgames.com/Goodluck/play/

## The Making Of

I documented the process of creating this project in hope that it will help you learn about Goodluck's workflow.

### Step 0. Bootstrap a new project

<img src="screenshots/step0.png" align=right width=160>

I copy the files from a fresh Goodluck clone into this directory, and I run `./bootstrap.sh NewProject2D` to remove all other examples. I also remove directories with files that I won't need to create a 2D game: `assets`, `meshes`, and `textures`, as well as most shaders in the `materials` directory. I'll only need one shader which is used by Goodluck's default hardware-accelerated 2D renderer.

(In practice, it's often more convenient to [generate a new repository](https://github.com/piesku/goodluck/generate) using Goodluck as the template directly on GitHub. Here, however, I need to copy the files manually because I'm developing in a repository shared with other projects.)

After installing dev dependencies with `npm install`, I open the directory in VS Code and launch the build tasks with Cmd+Shift+B. This starts two parallel processes: `tsc` to type-check source files when they change, and `esbuild` to serve them at http://localhost:1234. I haven't made any changes to the code yet, so for now, the project is the default NewProject2D scene right after bootstrapping.

There is much more code that I could remove from the NewProject2D example knowing that I likely won't need it for this project. For example, I don't think I'll need the `AnimateSprite` component and the corresponding `sys_render2d_animate` system. I'm keeping them for now just in case. What I enjoy about Goodluck and more generally about the ECS architecture is that even if individual systems might appear very simple, unrelated, or not very interesting, an unusual combination of multiple systems can often yield very interesting behaviors. Some of them may be useful for debugging, too; it's best not too remove them too early.

At the end of this project I'll have another chance to remove unused components and systems to optimize the final build size.

### Step 1. Prototype the gameplay

<img src="screenshots/step1.png" align=right width=160>

The goal of this step is to get the rough gameplay ready to be tested and improved. I start by removing the default `scene_stage` and build my own `scene_main` with the player's paddle. The paddle is simply a red rectangle (the `draw_rect()` component mixin). It also has a dynamic collider (`collide2d(true)`), can move (`move2d()`), and can be controlled by the player (`control_player()`).

Next, I add the ball (a blue square), which can move (`move2d()`), and which uses `control_always2d()` to continue moving every frame. `Move2d` merely gives an entity the ability to move, but it still needs another system to set the movement direction, e.g. based on the user's input. Goodluck uses the convention of _control_ systems which inform other systems what to do.

Finally, I create a grid of green bricks in `scene_main`, each with a static collider (`collide2d(false)`, which means the positions of the collider is not updated each frame). I also introduce a new component bit, `Has.ControlBrick`, and a corresponding system, `sys_control_brick`. In this system, each brick checks for any collisions registered by its collider; if there were any, the brick destroys itself.

To make the ball bounce off the paddle, bricks, and the walls of the playing area, I create `sys_control_bounce`. I don't have any strict way of identifying the ball among all other entites (like I do with `Has.ControlBrick` for bricks). However, using the `Has.LocalTransform2D | Has.ControlAlways2D | Has.Collide2D` union is good enough for now. In fact, this is another thing that I enjoy about the ECS architecture — I don't actually need to special-case the ball here. Any entity with these components will get the behavior of bouncing off other game objects.

### Step 2. Minimum Shippable Product

<img src="screenshots/step2b.png" align=right width=160>
<img src="screenshots/step2a.png" align=right width=160>

In this step I'm going to focus on making the game look like it's supposed to. I'll also implement the full user flow, from launching the game and seeing the title screen, to starting to play, to counting and displaying the score, and finally, to having a clear lose condition.

I start by copying the assets, `block.png` and `circle.png`, into `sprites/`. There's a `Makefile` inside it which builds a single spritesheet out of all PNGs in the directory, optimized in the WEBP format. It also produces a spritesheet map, `spritesheet.ts` which is then used by `render2d` to resolve sprite names to spritesheet coordinates.

The `Render2D` component takes advantage of Goodluck's 2D renderer implemented in WebGL2. This is in contrast to the `Draw2D` component which I used in Step 1 to draw simple rectangles, and which uses the Context2D drawing API. Thanks to WebGL2's instanced drawing, `sys_render2d` renders all sprites with a single draw call, making it very fast. Modern computers and phones should be able to render 50,000 to 100,000 sprites at 60 FPS. As an additional optimization, entities with `local_transform2d()` but _without_ `spatial_node2d()` have their transformation matrix computed directly in the shader, increasing performance even further. Such entities are great for particles and background tiles; without the `SpatialNode2D` component they cannot be parents nor children of other entities.

I tweak the colors and switch `draw_rect()` to `render2d()` in all blueprints (i.e. functions that define game objects). It's time for some UI. I build it using regular HTML and CSS, which means that I can leverage the CSS Grid for creating a responsive layout, as well as many other features of the platform. To manage the UI's state, Goodluck uses a pattern which should be familiar to React developers: the UI components are defined declaratively as strings of HTML content, and read the UI's state defined on the `Game` object. The binding is one-way; to mutate the state, you need to emit an _action_ which is processed by a reducer-like function called `dispatch`. If the HTML produced by the UI components changes between frames, the _entire_ UI is updated via `innerHTML = newContent`. This is a bit like Virtual DOM diffing, except that [implemented in 4 lines of code](https://github.com/piesku/goodluck/blob/387b4f0ff0f3e10514628a1715315ea9dc4f5681/core/systems/sys_ui.ts#L11-L14) :). It's terrible for user input, but good enough for small games, usually!

The `dispatch` function is a bit of an escape hatch. Contrary to proper reducers, it's allowed to mutate the game's state and to cause side-effects. It's the perfect place to put the logic of spawning a new ball after the player loses the current one.

I define a few actions like `BrickDestroyed` and `BallOutOfBounds` and I modify `sys_control_brick` and `sys_control_bounce` to dispatch them when, respectively, a brick entity is hit by the ball and destroyed, and when the ball goes beyond the bottom edge of the scene. I also define `Game.PlayState` which is an enum of `Title`, `Playing`, `BallLost`, and `GameOver`. I'll use it to transition between the "views" of the game, and to know which UI component should be visible.

Lastly, I add `logo.png`, which is displayed on the title screen. It's an 8KB image and takes half of the build size, but that's OK for this project. In fact, I quite like it as an illustration of how small the code really is compared to a single image file!

### Step 3. Add polish

<img src="screenshots/step3.png" align=right width=160>

The game is already looking good. I can now spend some time adding non-critical features with the goal of improving the user's experience and making the game _feel_ better.

I start by adding mouse and touch input. The control scheme is simple enough that I don't need to handle mouse and touch separately. I rename `sys_control_mouse` to `sys_control_pointer` and I use `viewport_to_world()` from `common/input.ts` to convert the pointer coordinates in pixels to world coordinates. Goodluck uses abstract "world" units which don't easily translate into pixels. Instead, `viewport_to_world()` takes into account the position and the projection of the camera.

I could also add logic to capture the mouse pointer, but then I'd actually need a separate system for handling mouse input. When the pointer is captured, mouse events don't have absolute positions attached to them and instead only report movement deltas.

I want to be able to emit particles when the ball hits a brick. Goodluck2D is still a young project and as of August 2022 doesn't come with a particle emitter built-in. (Previously, Goodluck focused on 3D games.) However, I should be able to create my own emitter by combining a few existing systems, and adding one custom one. First, I create `blueprint_boom()` which will be instantiated at a brick's position when it's destroyed. It will be a short-lived entity that creates particles around the collision. I give it a `lifespan()` to make it self-destruct after a few tenths of a second, and `spawn()` to make it spawn particles. Next, I create `blueprint_particle()` with `lifespan()`, `move2d()`, `control_always2d()`, `render2d()` and `order(1)` to make sure particles are drawn on top of everything else. Inside the blueprint function I randomize some parameters of a single particle, like its initial size, movement direction, speed, and alpha. I also add a new system, `sys_control_particle`, to be able to add a bit of custom logic to particles. Namely, I want to reduce their size, speed and alpha over time. Because this is a small and simple game, I'm able to get away with using the `Has.Lifespan | Has.Render2D | Has.LocalTransform2D | Has.Move2D` union to identify particles. In a larger project, I'd probably create a new component bit, `Has.Particle`, possibly with some particle-specific component data, like the start and the end speed, size, and color, to help with interpolating these properties properly. For now, I scale them down by `1 - delta` in each frame; it's not perfect but certainly good enough.

To make the particles look better I switch to additive blending. Because all entities are rendered in a single instanced draw call, the change is global. This is OK for this game, but I may need to batch drawing based on the blending mode in upstream Goodluck in the future (https://github.com/piesku/goodluck/issues/116).

Next, I add sound effects. Goodluck comes with its own work-in-progress audio synthesizer and playback system, which is based on the WebAudio API. It works best for 3D games (it supports spatial audio sources and listeners) but unfortunately the [synth editor](https://stasm.github.io/havefun/) is limited in features and not very user friendly as of August 2022. For js13kBreakout, I'm going to use [@KilledByAPixel](https://github.com/KilledByAPixel)'s excellent [ZzFX](https://killedbyapixel.github.io/ZzFX/) instead. I copy `zzfx.js` into `vendor/` and adapt it slightly to make it work well with TypeScript. I then define a few more actions, like `BallHitPaddle` and `BallHitEdge`, and I dispatch them from `sys_control_bounce`. This allows me to call `zzfx()` inside `dispatch()` when I process these actions.

Being granular about these `BallHit...` actions has the added benefit of making it very easy to implement two extra features. In `BallHitBrick` (previously called `BrickDestroyed`) I can add logic to save a new high score into `localStorage`. I also add a new state variable, `Game.Streak`, which I increment in `BallHitBrick` and reset in `BallHitPaddle` and `BallOutOfBounds`. With this change, the scoring logic becomes a bit more interesting — you get more points the longer the ball is on the loose.

For a bit of more challenge, I wrap up by increasing the ball's speed. The game's ready to ship!

## Running Locally

To run locally, install the dependencies and start the local dev server:

    npm install
    npm start

Then, open http://localhost:1234 in the browser. In VS Code, Ctrl+Shift+B will show the available build tasks, including `npm start`, and F5 will open the browser.

To produce an optimized build in `play/index.zip`, use the included `Makefile`. You'll need the 7-Zip command line utility installed.

    make -C play index.zip
