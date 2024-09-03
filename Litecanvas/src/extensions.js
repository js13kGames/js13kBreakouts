import "litecanvas";

// Litecanvas can easily extended using plugins (functions)

/**
 * By default litecanvas has a 12-colors palette.
 * This plugin will overrides the default colors.
 *
 * @param {LitecanvasInstance} engine
 * @param {LitecanvasPluginHelpers}
 */
export function customColors(engine, { colors }) {
  const customPalette = [
    // 0 - black
    "#212633",
    // 1 - gray (used in lifes)
    "#4c4c4c",
    // 2 - white
    "#ffffff",
    // 3~10 - few reds
    "#700f16",
    "#76121a",
    "#7c151d",
    "#831720",
    "#891a23",
    "#901d26",
    "#96202a",
    "#9c232d",
    // 11 - particle color
    "#9c232d",
  ];

  // overrides the litecanvas default colors
  colors.length = customPalette.length;
  for (const [index, color] of customPalette.entries()) {
    colors[index] = color;
  }
}

/**
 * Plugin to load images.
 *
 * This plugin exposes the function `loadImage`
 *
 * @param {LitecanvasInstance} engine
 */
export function imageLoader(engine) {
  engine.setvar("LOADING", 0);

  const loadImage = async (src, callback) => {
    const image = new Image();

    image.crossOrigin = "anonymous";
    engine.setvar("LOADING", engine.LOADING + 1);

    image.onload = () => {
      callback(image);
      engine.setvar("LOADING", engine.LOADING - 1);
    };

    image.src = src;
  };

  return { loadImage };
}
