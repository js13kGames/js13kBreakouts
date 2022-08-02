import {html} from "../../common/html.js";
import {Action, HIGH_SCORE_KEY, PlayState} from "../actions.js";
import {Game} from "../game.js";

export function App(game: Game) {
    switch (game.PlayState) {
        case PlayState.Title:
            return Title(game);
        case PlayState.Playing:
        case PlayState.BallLost:
        case PlayState.GameOver:
            return Playing(game);
    }
}

function Title(game: Game) {
    let high_score = localStorage[HIGH_SCORE_KEY];
    return html`
        <div
            style="
                height: min(100vh, 177vw);
                width: min(100vw, 56vh);
                font: 1rem Arial;
                color: #fff;

                display: grid;
                grid-template-columns: 1fr;
                grid-template-rows: 4fr 2fr 1fr 1fr;
                grid-gap: 0px 0px;
                grid-template-areas: 'logo' 'cta' 'highscore' '.';
                place-items: center;

                background: #212633;
            "
            onclick="$(${Action.StartGame})"
        >
            <img src="./logo.png" style="grid-area: logo; width: 80%;" />
            ${CallToAction("Click to Play")}
            ${high_score &&
            `<div style="grid-area: highscore; font-size: min(5vmin, 2rem); text-align: center;">High Score<br>${high_score}</div>`}
        </div>
    `;
}

function Playing(game: Game) {
    return html`
        <div
            style="
                height: min(100vh, 177vw);
                width: min(100vw, 56vh);
                font: 1rem Arial;
                color: #fff;

                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 12% 1fr 12%;
                grid-gap: 0px 0px;
                grid-template-areas: 'score lives .' 'cta cta cta' '. . .';
                place-items: center;
            "
            ${game.PlayState === PlayState.BallLost && `onclick="$(${Action.ContinuePlaying})"`}
            ${game.PlayState === PlayState.GameOver && `onclick="$(${Action.BackToTitle})"`}
        >
            ${Score(game.Score)} ${LivesLeft(game.Lives)}
            ${game.PlayState === PlayState.BallLost && CallToAction("Click to Play")}
            ${game.PlayState === PlayState.GameOver && CallToAction("Game Over")}
        </div>
    `;
}

function Score(score: number) {
    return `<div style="grid-area: score; font-size: min(5vmin, 2rem);">${score}</div>`;
}

function CallToAction(text: string) {
    return `<div style="grid-area: cta; font-size: min(9vmin, 4rem);">${text}</div>`;
}

function LivesLeft(left: number) {
    let boxes = [];
    for (let i = 0; i < 3; i++) {
        let color = i < left ? "#fff" : "#4c4c4c";
        boxes.push(`
            <div style="
                width: min(5vmin, 1.5rem);
                height: min(5vmin, 1.5rem);
                margin: 0.2rem;
                background: ${color};
                border-radius: 3px;
            "></div>
        `);
    }
    return html` <div style="grid-area: lives; display: flex;">${boxes}</div> `;
}
