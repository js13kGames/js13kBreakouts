import {instantiate} from "../common/game.js";
import {DEG_TO_RAD, Vec2} from "../common/math.js";
import {float} from "../common/random.js";
import {Entity} from "../common/world.js";
import {zzfx} from "../vendor/zzfx.js";
import {control_always2d} from "./components/com_control_always2d.js";
import {copy_position} from "./components/com_transform2d.js";
import {Game} from "./game.js";
import {blueprint_ball} from "./scenes/blu_ball.js";
import {blueprint_boom} from "./scenes/blu_boom.js";
import {scene_main} from "./scenes/sce_main.js";

export const enum Action {
    StartGame,
    BallHitEdge,
    BallHitPaddle,
    BallHitBrick,
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

export const HIGH_SCORE_KEY = "Goodluck_BreakoutHighScore";

const SOUND_START = [, 0, 500, , 0.04, 0.3, 1, 2, , , 570, 0.02, 0.02, , , , 0.04];
const SOUND_BOUNCE = [, , 1e3, , 0.03, 0.02, 1, 2, , , 940, 0.03, , , , , 0.2, 0.6, , 0.06];
const SOUND_BRICK = [, , 90, , 0.01, 0.03, 4, , , , , , , 9, 50, 0.2, , 0.2, 0.01];
const SOUND_LOSE = [
    1.31,
    ,
    154,
    0.05,
    0.3,
    0.37,
    1,
    0.3,
    -9.9,
    -6.9,
    ,
    ,
    0.11,
    ,
    ,
    0.2,
    0.02,
    0.42,
    0.16,
];

export function dispatch(game: Game, action: Action, payload: unknown) {
    switch (action) {
        case Action.StartGame: {
            game.PlayState = PlayState.Playing;
            game.Score = 0;
            game.Lives = 3;
            scene_main(game);

            zzfx(SOUND_START);
            break;
        }
        case Action.BallHitEdge: {
            zzfx(SOUND_BOUNCE);
            break;
        }
        case Action.BallHitPaddle: {
            game.Streak = 0;
            zzfx(SOUND_BOUNCE);
            break;
        }
        case Action.BallHitBrick: {
            game.Streak++;
            game.Score += game.Streak;

            let high_score = localStorage[HIGH_SCORE_KEY] || 0;
            if (game.Score > high_score) {
                localStorage[HIGH_SCORE_KEY] = game.Score;
            }

            // Create a particle emitter entity at the destroyed brick's position.
            let brick_entity = payload as Entity;
            let brick_collide = game.World.Collide2D[brick_entity];
            let boom_position: Vec2 = [brick_collide.Center[0], brick_collide.Center[1]];
            instantiate(game, [...blueprint_boom(game), copy_position(boom_position)]);

            zzfx(SOUND_BRICK);
            break;
        }
        case Action.BallOutOfBounds: {
            game.Streak = 0;
            game.Lives--;
            if (game.Lives <= 0) {
                game.PlayState = PlayState.GameOver;
            } else {
                game.PlayState = PlayState.BallLost;
            }

            zzfx(SOUND_LOSE);
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
