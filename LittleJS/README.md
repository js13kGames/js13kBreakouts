## js13kBreakout with LittleJS 🚂

## [Live Demo](https://breakouts.js13kgames.com/LittleJS/) - LittleJS js13kBreakout demo

## [LittleJS on GitHub](https://github.com/KilledByAPixel/LittleJS) - LittleJS Engine code and examples

## Helpful links...

### [LittleJS Documentation](https://killedbyapixel.github.io/LittleJS/docs) - Learn how to use LittleJS
###  [LittleJS Trailer](https://youtu.be/chuBzGjv7Ms) - Watch this trailer to see what it can do
### [LittleJS Discord](https://discord.gg/zb7hcGkyZe) - You can ask questions here and show off your work
### [Space Huggers with LittleJS](https://www.newgrounds.com/portal/view/819609) - A game I developed to show off the engine

## Building for js13k with LittleJS...

There is a build file included which uses most engine features and builds the default example into around a 7kb zip. This includes all the overhead of the engine leaving plenty of space for your game. You can use the buildSetup.bat file to install build dependencies with npm and run build.bat to build the package.

The build system works by combining all the js files together, then running several minifiers on the code and zipping the result. You may want to modify the build script to include additional files for your project. These minifiers like Closure and Terser are very good at simplifying code and removing unused code.

It is possible to save even more space by converting the png to a data uri and using that as the image source in the code rather then including a separate file.
