/*
    LittleJS Breakout Example
*/

'use strict';

const maxLives = 3;
const ballSpeed = 15;
const highScoreKey = 'ljsBreakoutHighScore';
const logoImage = new Image();

// sound effects
const sound_start      = new Sound([,0,500,,.04,.3,1,2,,,570,.02,.02,,,,.04]);
const sound_breakBlock = new Sound([,,90,,.01,.03,4,,,,,,,9,50,.2,,.2,.01], 0);
const sound_bounce     = new Sound([,,1e3,,.03,.02,1,2,,,940,.03,,,,,.2,.6,,.06], 0);
const sound_die        = new Sound([1.31,,154,.05,.3,.37,1,.3,-9.9,-6.9,,,.11,,,.2,.02,.42,.16]);

// globals
let ball, paddle, score, lives, bounces, isPlaying;

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    canvasFixedSize = vec2(1080, 1920);
    cameraPos = canvasFixedSize.scale(.5);
    cameraScale = 1;
    objectMaxSpeed = 100;

    localStorage[highScoreKey] = localStorage[highScoreKey] || 0;
}

///////////////////////////////////////////////////////////////////////////////
function startGame()
{
    engineObjectsDestroy();
    lives = maxLives;
    paddle = new Paddle(vec2(cameraPos.x, 100));
    bounces = score = 0;

    // spawn blocks
    let bs = vec2(150,60);
    let ls = vec2(7,8);
    let pos = vec2()
    pos.x = cameraPos.x - bs.x*(ls.x-1)/2;
    pos.y = canvasFixedSize.y-bs.y*(ls.y)-200;
    
    for (let i = ls.x; i--;)
    for (let j = ls.y; j--;)
    {
        let color = (new Color(64.7/100,15/99,19/99)).lerp(new Color(.44,.06,.09), j/ls.y);
        new Block(pos.add(vec2(i,j).multiply(bs)), color);
    }

}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    // spawn ball
    if (!ball && (mouseWasPressed(0) || gamepadWasPressed(0)))
    {
        if (!isPlaying || !lives)
            startGame();

        isPlaying = 1;
        ball = new Ball(cameraPos);
        sound_start.play();
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    // draw the background
    drawRect(canvasFixedSize.scale(.5), canvasFixedSize, new Color(.13, .15, .2));
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    if (isPlaying)
    {
        drawText(score, vec2(99, canvasFixedSize.y-99), 64)

        for(let i = maxLives; i--;)
        {
            let color = i < lives ? new Color(1,1,1) : new Color(.3,.3,.3);
            drawTile(vec2(canvasFixedSize.x/2+50*i-50*(maxLives-1)/2, canvasFixedSize.y-99), vec2(32), 1, vec2(128), color);
        }
    }
    else
    {
        overlayContext.drawImage(logoImage,overlayCanvas.width/2-logoImage.width/2,90);
    }

    if (!ball || !isPlaying)
        drawText(lives || !isPlaying? 'Click to Play' : 'Game Over', cameraPos.add(vec2(0,-100)), 100, new Color);

    if (!isPlaying)
        drawText('High Score\n' + localStorage[highScoreKey], cameraPos.add(vec2(0,-300)), 70, new Color);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine

// startup when logo is finished
logoImage.src = 'logo.png';
logoImage.onload = ()=> engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'tiles.png?1');