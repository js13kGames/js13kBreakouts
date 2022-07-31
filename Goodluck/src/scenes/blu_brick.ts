import {collide2d} from "../components/com_collide2d.js";
import {control_brick} from "../components/com_control_brick.js";
import {draw_rect} from "../components/com_draw.js";
import {local_transform2d, spatial_node2d} from "../components/com_transform2d.js";
import {Game, Layer} from "../game.js";

export const BRICK_WIDTH = 1.7;
export const BRICK_HEIGHT = 0.7;

export function blueprint_brick(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        control_brick(),
        collide2d(false, Layer.Object, Layer.Object, [BRICK_WIDTH, BRICK_HEIGHT]),
        draw_rect("green", BRICK_WIDTH, BRICK_HEIGHT),
    ];
}
