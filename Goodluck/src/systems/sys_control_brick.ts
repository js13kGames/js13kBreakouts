import {Action, dispatch} from "../actions.js";
import {destroy_all} from "../components/com_children.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlBrick | Has.Collide2D;

export function sys_control_brick(game: Game, delta: number) {
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) === QUERY) {
            let collide = game.World.Collide2D[ent];
            if (collide.Collisions.length > 0) {
                destroy_all(game.World, ent);
                dispatch(game, Action.BallHitBrick, ent);
            }
        }
    }
}
