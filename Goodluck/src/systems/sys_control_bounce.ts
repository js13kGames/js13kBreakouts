import {DEG_TO_RAD} from "../../common/math.js";
import {map_range} from "../../common/number.js";
import {Entity} from "../../common/world.js";
import {Action, dispatch} from "../actions.js";
import {destroy_all} from "../components/com_children.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.LocalTransform2D | Has.ControlAlways2D | Has.Collide2D;

export function sys_control_bounce(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) == QUERY) {
            update(game, i);
        }
    }
}

function update(game: Game, entity: Entity) {
    let collide = game.World.Collide2D[entity];
    let control = game.World.ControlAlways2D[entity];
    let local = game.World.LocalTransform2D[entity];

    if (control.Direction === null) {
        // The ball is not moving.
        return;
    }

    let top = game.SceneHeight / 2;
    let right = game.SceneWidth / 2;

    if (local.Translation[1] > top) {
        local.Translation[1] = top;
        control.Direction[1] *= -1;
        dispatch(game, Action.BallHitEdge, entity);
    }

    if (local.Translation[1] < -top) {
        destroy_all(game.World, entity);
        dispatch(game, Action.BallOutOfBounds, entity);
    }

    if (local.Translation[0] < -right) {
        local.Translation[0] = -right;
        control.Direction[0] *= -1;
        dispatch(game, Action.BallHitEdge, entity);
    }

    if (local.Translation[0] > right) {
        local.Translation[0] = right;
        control.Direction[0] *= -1;
        dispatch(game, Action.BallHitEdge, entity);
    }

    if (collide.Collisions.length > 0) {
        let collision = collide.Collisions[0];
        if (collision.Hit[0]) {
            local.Translation[0] += collision.Hit[0];
            control.Direction[0] *= -1;

            if (game.World.Signature[collision.Other] & Has.ControlPlayer) {
                dispatch(game, Action.BallHitPaddle, entity);
            }
        }
        if (collision.Hit[1]) {
            local.Translation[1] += collision.Hit[1];

            if (game.World.Signature[collision.Other] & Has.ControlPlayer) {
                // It's the paddle!
                let paddle_collider = game.World.Collide2D[collision.Other];
                let x_diff = collide.Center[0] - paddle_collider.Center[0];
                let x_max = paddle_collider.Size[0] / 2;
                let angle = map_range(x_diff, -x_max, x_max, 135 * DEG_TO_RAD, 45 * DEG_TO_RAD);
                control.Direction[0] = Math.cos(angle);
                control.Direction[1] = Math.sin(angle) * Math.sign(-control.Direction[1]);
                dispatch(game, Action.BallHitPaddle, entity);
            } else {
                control.Direction[1] *= -1;
            }
        }
    }
}
