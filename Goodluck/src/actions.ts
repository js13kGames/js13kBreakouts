import {instantiate} from "../common/game.js";
import {DEG_TO_RAD} from "../common/math.js";
import {float} from "../common/random.js";
import {control_always2d} from "./components/com_control_always2d.js";
import {copy_position} from "./components/com_transform2d.js";
import {Game} from "./game.js";
import {blueprint_ball} from "./scenes/blu_ball.js";
import {scene_main} from "./scenes/sce_main.js";

export const enum Action {
    StartGame,
    BrickDestroyed,
    BallOutOfBounds,
    ContinuePlaying,
    BackToTitle,
}

export const enum PlayState {
    Title,
    Playing,
    BallLost,
    GameOver,
}

export function dispatch(game: Game, action: Action, payload: unknown) {
    switch (action) {
        case Action.StartGame: {
            game.PlayState = PlayState.Playing;
            game.Score = 0;
            game.Lives = 3;
            scene_main(game);
            break;
        }
        case Action.BrickDestroyed: {
            game.Score++;
            break;
        }
        case Action.BallOutOfBounds: {
            game.Lives--;
            if (game.Lives <= 0) {
                game.PlayState = PlayState.GameOver;
            } else {
                game.PlayState = PlayState.BallLost;
            }
            break;
        }
        case Action.ContinuePlaying: {
            game.PlayState = PlayState.Playing;

            // Spawn a new ball.
            let angle = float(135, 45) * DEG_TO_RAD;
            instantiate(game, [
                ...blueprint_ball(game),
                copy_position([
                    float(-game.SceneWidth / 3, game.SceneWidth / 3),
                    -game.SceneHeight / 2 + float(3, 5),
                ]),
                // Override the blueprint's direction.
                control_always2d([Math.cos(angle), Math.sin(angle)], 0),
            ]);
            break;
        }
        case Action.BackToTitle: {
            game.PlayState = PlayState.Title;
            break;
        }
    }
}
