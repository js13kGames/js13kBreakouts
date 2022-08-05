import {instantiate} from "../../common/game.js";
import {camera2d} from "../components/com_camera2d.js";
import {draw_rect} from "../components/com_draw.js";
import {copy_position, local_transform2d, spatial_node2d} from "../components/com_transform2d.js";
import {Game, WORLD_CAPACITY} from "../game.js";
import {World} from "../world.js";
import {blueprint_ball} from "./blu_ball.js";
import {blueprint_brick, BRICK_HEIGHT, BRICK_WIDTH} from "./blu_brick.js";
import {blueprint_paddle} from "./blu_paddle.js";

export function scene_main(game: Game) {
    game.World = new World(WORLD_CAPACITY);
    game.ViewportResized = true;

    // Camera.
    instantiate(game, [
        spatial_node2d(),
        local_transform2d([0, 0]),
        camera2d([game.SceneWidth / 2, game.SceneHeight / 2]),
    ]);

    // Background.
    instantiate(game, [
        spatial_node2d(),
        local_transform2d([0, 0]),
        draw_rect("#212633", game.SceneWidth, game.SceneHeight),
    ]);

    // Player's paddle.
    instantiate(game, [...blueprint_paddle(game), copy_position([0, -game.SceneHeight / 2 + 1.5])]);

    // The ball.
    instantiate(game, [...blueprint_ball(game), copy_position([0, -game.SceneHeight / 2 + 3])]);

    // The bricks.
    let padding = 0.3;
    for (let row = 0; row < 8; row++) {
        let y = game.SceneHeight / 2 - 3.5 - row * (BRICK_HEIGHT + padding);
        for (let col = -3; col < 4; col++) {
            let x = col * (BRICK_WIDTH + padding);
            instantiate(game, [...blueprint_brick(game, y / 8), copy_position([x, y])]);
        }
    }
}
