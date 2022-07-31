import {dispatch} from "./actions.js";
import {Game} from "./game.js";
import {scene_main} from "./scenes/sce_main.js";

let game = new Game();
scene_main(game);
game.Start();

// @ts-ignore
window.$ = dispatch.bind(null, game);

// @ts-ignore
window.game = game;
