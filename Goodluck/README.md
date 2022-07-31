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

## Running Locally

To run locally, install the dependencies and start the local dev server:

    npm install
    npm start

Then, open http://localhost:1234 in the browser. In VS Code, Ctrl+Shift+B will show the available build tasks, including `npm start`, and F5 will open the browser.

To produce an optimized build in `play/index.zip`, use the included `Makefile`. You'll need the 7-Zip command line utility installed.

    make -C play index.zip
