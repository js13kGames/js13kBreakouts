/*
    LittleJS Breakout Example
*/

'use strict';

// globals
const highScoreKey = 'LittleJS_BreakoutHighScore';
const logoImage = new Image();
const maxLives = 3;

// game state
let ball, paddle, score, lives, bounceCount, isPlaying, worldSize, usingKeyboard;

// sound effects
const sound_start      = new Sound([,0,500,,.04,.3,1,2,,,570,.02,.02,,,,.04]);
const sound_breakBlock = new Sound([,,90,,.01,.03,4,,,,,,,9,50,.2,,.2,.01], 0);
const sound_bounce     = new Sound([,,1e3,,.03,.02,1,2,,,940,.03,,,,,.2,.6,,.06], 0);
const sound_die        = new Sound([1.31,,154,.05,.3,.37,1,.3,-9.9,-6.9,,,.11,,,.2,.02,.42,.16]);

///////////////////////////////////////////////////////////////////////////////
function gameInit() // called once after LittleJS starts up
{
    // init fixed size 1080p canvas
    canvasFixedSize = vec2(1080, 1920);

    // fit camera to world
    worldSize = vec2(14, 30);
    cameraScale = canvasFixedSize.x / worldSize.x;
    cameraPos = worldSize.scale(.5);

    // init high score
    if (!localStorage[highScoreKey])
        localStorage[highScoreKey] = 0;
}

///////////////////////////////////////////////////////////////////////////////
function startGame()
{
    // clear all game objects and reset
    engineObjectsDestroy();
    lives = maxLives;
    score = 0;
    bounceCount = 0;
    isPlaying = 1;

    // spawn player paddle
    paddle = new Paddle(vec2(cameraPos.x, 4));

    // spawn blocks
    let pos = vec2();
    for (pos.x = 1-worldSize.x; pos.x <= worldSize.x; pos.x += 2)
    for (pos.y = 24; pos.y > 16; pos.y -= 1)
    {
        const color1 = new Color(.44, .06, .09);
        const color2 = new Color(.64, .15, .19);
        const colorPercent = percent(pos.y, 24, 16);
        new Block(pos, color1.lerp(color2, colorPercent));
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() // called every frame by LittleJS at 60 fps
{
    // wait for user input to start
    if (!ball && (mouseWasPressed(0) || gamepadWasPressed(0) || keyWasPressed(13) || keyWasPressed(32)))
    {
        if (!isPlaying)
            startGame();
        else if (!lives)
        {
            // game over
            isPlaying = 0;
            engineObjectsDestroy();
        }

        if (isPlaying)
        {
            // spawn ball
            ball = new Ball(cameraPos);
            sound_start.play();
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() // called after LittleJS objects are updated
{
    // unused for this demo
}

///////////////////////////////////////////////////////////////////////////////
function gameRender() // called before LittleJS objects are rendered
{
    // draw the background
    drawRectScreenSpace(canvasFixedSize.scale(.5), canvasFixedSize, new Color(.13, .15, .2));
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() // called after LittleJS objects are rendered
{
    if (isPlaying)
    {
        // draw score
        drawText(score, vec2(2, worldSize.y-4))

        // draw lives
        for(let i = maxLives; i--;)
        {
            let pos = vec2(worldSize.x/2 + i - (maxLives-1)/2,  worldSize.y-4);
            let color = i < lives ? new Color : new Color(.3, .3, .3);
            drawTile(pos, vec2(.8), 1, vec2(128), color);
        }
    }
    else
    {
        // draw logo
        overlayContext.drawImage(logoImage, overlayCanvas.width/2 - logoImage.width/2, 100);
        drawText('LittleJS Edition', cameraPos.add(vec2(0, 2)), 1);
    }

    // show hud text
    if (!ball || !isPlaying)
        drawText(lives || !isPlaying? 'Click to Play' : 'Game Over', cameraPos.add(vec2(0, -2)), 2);
    if (!isPlaying)
        drawText('High Score\n' + localStorage[highScoreKey], cameraPos.add(vec2(0, -4)), 1);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine

// startup when logo is finished loading
logoImage.onload = ()=> engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'tiles.png');
logoImage.src = 'logo.png';