import {float} from "../../common/random.js";
import {lifespan} from "../components/com_lifespan.js";
import {spawn} from "../components/com_spawn.js";
import {local_transform2d, spatial_node2d} from "../components/com_transform2d.js";
import {Game} from "../game.js";
import {blueprint_particle} from "./blu_particle.js";

export function blueprint_boom(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        lifespan(float(0.1, 0.2)),
        spawn(blueprint_particle, 0),
    ];
}
