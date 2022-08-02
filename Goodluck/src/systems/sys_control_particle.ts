import {scale} from "../../common/vec2.js";
import {get_alpha, set_alpha} from "../components/com_render2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Lifespan | Has.Render2D | Has.LocalTransform2D | Has.Move2D;

export function sys_control_particle(game: Game, delta: number) {
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) === QUERY) {
            let local = game.World.LocalTransform2D[ent];
            let move = game.World.Move2D[ent];

            // By multiplying by t each frame, we get exponential fading.
            let t = 1 - delta;

            // Reduce the opacity.
            let a = get_alpha(game, ent);
            set_alpha(game, ent, a * t);

            // Reduce the size.
            scale(local.Scale, local.Scale, t);
            game.World.Signature[ent] |= Has.Dirty;

            // Reduce the speed.
            move.MoveSpeed *= t;
        }
    }
}
