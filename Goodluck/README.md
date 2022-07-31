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

## Running Locally

To run locally, install the dependencies and start the local dev server:

    npm install
    npm start

Then, open http://localhost:1234 in the browser. In VS Code, Ctrl+Shift+B will show the available build tasks, including `npm start`, and F5 will open the browser.

To produce an optimized build in `play/index.zip`, use the included `Makefile`. You'll need the 7-Zip command line utility installed.

    make -C play index.zip
