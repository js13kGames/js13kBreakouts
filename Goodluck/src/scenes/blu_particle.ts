import {DEG_TO_RAD, Vec4} from "../../common/math.js";
import {float} from "../../common/random.js";
import {control_always2d} from "../components/com_control_always2d.js";
import {lifespan} from "../components/com_lifespan.js";
import {move2d} from "../components/com_move2d.js";
import {order, render2d} from "../components/com_render2d.js";
import {local_transform2d} from "../components/com_transform2d.js";
import {Game} from "../game.js";

export function blueprint_particle(game: Game) {
    let ttl = float(0.2, 0.3);
    let angle = float(0, 360) * DEG_TO_RAD;
    let speed = float(1, 9);
    let scale = float(0.2, 0.9);
    let color: Vec4 = [0.91, 0.53, 0.61, float(0.3, 0.7)];
    return [
        local_transform2d(undefined, undefined, [scale, scale]),
        lifespan(ttl),
        control_always2d([Math.cos(angle), Math.sin(angle)], 0),
        move2d(speed, 0),
        render2d("circle.png", color),
        order(1),
    ];
}
