import {Entity} from "../../common/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Collide2D | Has.ControlPlayer | Has.LocalTransform2D | Has.Move2D;

export function sys_control_keyboard(game: Game, delta: number) {
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) == QUERY) {
            update(game, ent);
        }
    }
}

function update(game: Game, entity: Entity) {
    let collide = game.World.Collide2D[entity];
    let local = game.World.LocalTransform2D[entity];
    let move = game.World.Move2D[entity];

    let right = game.SceneWidth / 2 - collide.Size[0] / 2;

    if (local.Translation[0] <= -right) {
        local.Translation[0] = -right;
        game.World.Signature[entity] |= Has.Dirty;
    } else if (game.InputState["ArrowLeft"]) {
        move.Direction[0] -= 1;
        game.World.Signature[entity] |= Has.Dirty;
    }

    if (local.Translation[0] >= right) {
        local.Translation[0] = right;
        game.World.Signature[entity] |= Has.Dirty;
    } else if (game.InputState["ArrowRight"]) {
        move.Direction[0] += 1;
        game.World.Signature[entity] |= Has.Dirty;
    }
}
