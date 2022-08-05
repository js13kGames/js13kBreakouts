import {collide2d} from "../components/com_collide2d.js";
import {control_player} from "../components/com_control_player.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {local_transform2d, spatial_node2d} from "../components/com_transform2d.js";
import {Game, Layer} from "../game.js";

const PADDLE_WIDTH = 3;
const PADDLE_HEIGHT = 0.7;

export function blueprint_paddle(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(undefined, undefined, [PADDLE_WIDTH, PADDLE_HEIGHT]),
        collide2d(true, Layer.Object, Layer.None, [PADDLE_WIDTH, PADDLE_HEIGHT]),
        control_player(),
        move2d(7, 0),
        render2d("block.png"),
    ];
}
