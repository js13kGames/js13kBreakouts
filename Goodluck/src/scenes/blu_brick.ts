import {Vec4} from "../../common/math.js";
import {lerp} from "../../common/vec4.js";
import {collide2d} from "../components/com_collide2d.js";
import {control_brick} from "../components/com_control_brick.js";
import {render2d} from "../components/com_render2d.js";
import {local_transform2d, spatial_node2d} from "../components/com_transform2d.js";
import {Game, Layer} from "../game.js";

export const BRICK_WIDTH = 1.7;
export const BRICK_HEIGHT = 0.7;

const COLOR_TOP: Vec4 = [0.44, 0.06, 0.09, 1];
const COLOR_BOTTOM: Vec4 = [0.64, 0.15, 0.19, 1];

export function blueprint_brick(game: Game, color_interpolant: number) {
    let color: Vec4 = [0, 0, 0, 1];
    return [
        spatial_node2d(),
        local_transform2d(undefined, undefined, [BRICK_WIDTH, BRICK_HEIGHT]),
        control_brick(),
        collide2d(false, Layer.Object, Layer.Object, [BRICK_WIDTH, BRICK_HEIGHT]),
        render2d("block.png", lerp(color, COLOR_BOTTOM, COLOR_TOP, color_interpolant)),
    ];
}
