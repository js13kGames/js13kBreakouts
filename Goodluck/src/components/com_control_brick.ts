/**
 * @module components/com_control_brick
 */

import {Entity} from "../../common/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export function control_brick() {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlBrick;
    };
}
