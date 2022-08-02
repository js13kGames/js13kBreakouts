import {collide2d} from "../components/com_collide2d.js";
import {control_always2d} from "../components/com_control_always2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {local_transform2d, spatial_node2d} from "../components/com_transform2d.js";
import {Game, Layer} from "../game.js";

const BALL_WIDTH = 0.7;
const BALL_HEIGHT = 0.7;

export function blueprint_ball(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(undefined, undefined, [BALL_WIDTH, BALL_HEIGHT]),
        control_always2d([1, 1], 0),
        move2d(15, 0),
        collide2d(true, Layer.Object, Layer.Object, [BALL_WIDTH, BALL_HEIGHT]),
        render2d("circle.png"),
    ];
}
