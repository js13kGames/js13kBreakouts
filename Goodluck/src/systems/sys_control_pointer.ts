import {pointer_viewport} from "../../common/input.js";
import {Vec2} from "../../common/math.js";
import {Entity} from "../../common/world.js";
import {viewport_to_world} from "../components/com_camera2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

// Movement by the pointer (mouse or touch) is direct, i.e. the entity
// immediately moves to the pointer position. This is in contrast to
// sys_control_keyboard, which uses sys_move2d to move the paddle with a
// constant speed.

const QUERY = Has.Collide2D | Has.ControlPlayer | Has.LocalTransform2D;

export function sys_control_pointer(game: Game, delta: number) {
    let camera_entity = game.Cameras[0];
    if (camera_entity === undefined) {
        return;
    }

    let pointer_position: Vec2 = [0, 0];
    if (pointer_viewport(game, pointer_position)) {
        let camera = game.World.Camera2D[camera_entity];
        viewport_to_world(pointer_position, camera, pointer_position);

        for (let ent = 0; ent < game.World.Signature.length; ent++) {
            if ((game.World.Signature[ent] & QUERY) == QUERY) {
                update(game, ent, pointer_position);
            }
        }
    }
}

function update(game: Game, entity: Entity, pointer_position: Vec2) {
    let collide = game.World.Collide2D[entity];
    let local = game.World.LocalTransform2D[entity];

    let right = game.SceneWidth / 2 - collide.Size[0] / 2;
    let pointer_x = pointer_position[0];

    if (pointer_x < -right) {
        local.Translation[0] = -right;
    } else if (pointer_x > right) {
        local.Translation[0] = right;
    } else {
        local.Translation[0] = pointer_x;
    }

    game.World.Signature[entity] |= Has.Dirty;
}
