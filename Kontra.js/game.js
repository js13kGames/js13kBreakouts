/*
    KontraJs Breakout Example
*/
import { zzfx } from './ZzFX.js'
import {
  init,
  initInput,
  onInput,
  gamepadAxis,
  keyPressed,
  pointerPressed,
  loadImage,
  collides,
  getWorldRect,
  clamp,
  degToRad,
  rotatePoint,
  movePoint,
  randInt,
  Text,
  Sprite,
  GameLoop
} from './kontra.mjs';
import {
  Paddle,
  Block,
  Ball
} from './gameObjects.js';
import {
  roundRect,
  circleRectCollision,
  vectorAngle,
  getSideOfCollision
} from './utils.js';

async function main() {
  let maxLives = 3;
  let highScoreKey = 'KontraJs_BreakoutHighScore';

  // globals
  let ball, paddle, score, lives, bounceCount, isPlaying, usingKeyboard, entities;

  ///////////////////////////////////////////////////////////////////////////////
  let { canvas, context } = init();
  initInput();

  // init high score
  localStorage[highScoreKey] = localStorage[highScoreKey] || 0;

  ///////////////////////////////////////////////////////////////////////////////
  // Objects
  let logoImage = await loadImage('logo.png');
  let mainText = Text({
    text: 'Click to Play',
    font: '154px Arial',
    color: 'white',
    x: canvas.width / 2,
    y: canvas.height / 2 + 76,
    anchor: {x: 0.5, y: 0.5}
  });
  let secondaryText = Text({
    text: 'High Score\n' + localStorage[highScoreKey],
    font: '77px Arial',
    color: 'white',
    x: canvas.width / 2,
    y: canvas.height / 2 + 347,
    anchor: {x: 0.5, y: 0.5},
    textAlign: 'center'
  });
  let scoreText = Text({
    text: 0,
    font: '77px Arial',
    color: 'white',
    x: 154,
    y: 111,
    anchor: {x: 0.5, y: 0.5}
  });

  ///////////////////////////////////////////////////////////////////////////////
  function startGame() {
    lives = maxLives;
    score = bounceCount = 0;
    isPlaying = 1;

    // spawn player paddle
    paddle = new Paddle({ x: 256, y: canvas.height - 111 });
    entities = [paddle];

    // spawn blocks
    let startX = 12;
    let startY = 239;
    let height = 53;
    let width = 130;
    let padding = 24;
    let colors = ['#700e16', '#76111a', '#7d141d', '#831720', '#891a23', '#901d26', '#96202a', '#9b232d'];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 7; col++) {
        let x = startX + col * (width + padding);
        let y = startY + row * (height + padding);

        entities.push(new Block({
          x,
          y,
          width,
          height,
          color: colors[row]
        }));
      }
    }
  }

  ///////////////////////////////////////////////////////////////////////////////
  onInput(['down', 'south', 'enter', 'space'], handleInput);
  function handleInput() {
    if (ball) return;

    if (!isPlaying)
      startGame();
    else if (!lives) {
      // game over
      isPlaying = 0;
      entities = [];
    }

    if (isPlaying) {
      // spawn ball
      ball = new Ball({ x: canvas.width / 2, y: canvas.height / 2 });
      zzfx(...[,0,500,,.04,.3,1,2,,,570,.02,.02,,,,.04]);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////
  function gameUpdate() {
    if (isPlaying) {
      if (ball) {
        let magnitude = ball.velocity.length();

        if (ball.y - ball.radius > canvas.height) {
          // destroy ball if it goes below the level
          ball = 0;
          lives--;
          zzfx(...[1.31,,154,.05,.3,.37,1,.3,-9.9,-6.9,,,.11,,,.2,.02,.42,.16]);
        }
        // bounce on sides and top
        else if (
          ball.x + ball.dx - ball.radius < 0 ||
          ball.x + ball.dx + ball.radius > canvas.width
        ) {
          ball.dx *= -1;
          ball.update();
          ball.bounce();
        }
        else if (ball.y + ball.dy - ball.radius < 0){
          ball.dy *= -1;
          ball.update();
          ball.bounce();
        }
        else if (circleRectCollision(ball, paddle)) {
          // put angle on the ball when it collides with paddle
          let radians = clamp(
            degToRad(-135),
            degToRad(-45),
            Math.atan2(ball.y - paddle.y, ball.x - paddle.x)
          );

          let { y } = rotatePoint(
            ball.velocity,
            radians
          );
          ball.dx = magnitude * Math.cos(radians);
          if (ball.y < paddle.y) {
            let dy = Math.max(Math.abs(y), 15);
            ball.dy = -clamp(0, 20, dy);
          }
          ball.update();
          ball.bounce();

          // reset ball count
          bounceCount = 0;
        }
        else {
          // lock-step collision detection for blocks by moving
          // the ball by small increments in order to not miss
          // any collision by the ball when it's either moving
          // very quickly or when multiple bounces would happen
          // in a single frame
          let step = ball.radius / 4;
          let accumulator = magnitude;
          let blocks = entities.filter(entity => entity.type == 1);
          let pos = { x: ball.x, y: ball.y };

          while (accumulator > 0) {
            // move the ball in the direction of the velocity
            // by the step counter
            let { x, y } = movePoint(
              pos,
              vectorAngle(ball.velocity),
              accumulator > step ? step : accumulator
            );

            for (let i = 0, block; block = blocks[i]; i++) {
              if (circleRectCollision(
                {x, y, radius: ball.radius},
                block
              )) {
                // remove block when hit with ball so we don't
                // check for collision with it again
                blocks.splice(i, 1);

                // destroy block
                block.ttl = 0;
                zzfx(...[,,90,,.01,.03,4,,,,,,,9,50,.2,,.2,.01]);

                // create particles
                let rand = Math.random;
                for (let j = randInt(20, 30); j--;) {
                  entities.push(Sprite({
                    x: block.x + block.width / 2,
                    y: block.y + block.height / 2,
                    dx: (rand() < 0.5 ? 1 : -1) * (rand() * 8),
                    dy: (rand() < 0.5 ? 1 : -1) * (rand() * 8),
                    radius: randInt(15, 30),
                    opacity: rand(),
                    color: '#e8879c',
                    ttl: 60,
                    update() {
                      this.opacity = clamp(0, 1, this.opacity - .05);
                      this.advance();
                    },
                    render() {
                      let { context, radius, color, alpha } = this;
                      context.fillStyle = color;
                      context.beginPath();
                      context.arc(0, 0, radius, 0, Math.PI * 2);
                      context.fill();
                    }
                  }));
                }

                let collision = getSideOfCollision(pos, block);
                if (collision.y) {
                  ball.dy *= -1;
                }
                else {
                  ball.dx *= -1;
                }

                // update score
                score += ++bounceCount;
                if (score > localStorage[highScoreKey])
                  localStorage[highScoreKey] = score;

                break;
              }
            }

            pos.x = x;
            pos.y = y;
            accumulator -= step;
          }

          // update ball to final position
          ball.x = pos.x;
          ball.y = pos.y;
        }
      }

      entities.map(entity => entity.update());

      // remove destroyed entities
      entities = entities.filter(entity => entity.isAlive());
    }
  }

  ///////////////////////////////////////////////////////////////////////////////
  function gameRender() {
    if (isPlaying) {
      // draw objects
      entities.map(entity => entity.render());
      if (ball) ball.render();

      // draw score
      scoreText.text = score;
      scoreText.render();

      // draw lives
      for (let i = 0; i < maxLives; i++) {
        let color = i < lives ? '#fff' : '#4c4c4c';
        let size = 61;
        let padding = 16;
        let x = canvas.width / 2 - (size + size / 2 + padding) + (i * (size + padding));
        roundRect(x, 81, size, size, 8, color);
        context.fill();
      }
    }
    else {
      // draw logo
      context.drawImage(logoImage, canvas.width / 2 - logoImage.width / 2, 90);
    }

    if (!ball || !isPlaying) {
      mainText.text = lives || !isPlaying ? 'Click to Play' : 'Game Over';
      mainText.render();
    }

    if (!isPlaying)
      secondaryText.render();
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Startup GameLoop
  let loop = GameLoop({
    update: gameUpdate,
    render: gameRender
  });
  loop.start();
}

main();