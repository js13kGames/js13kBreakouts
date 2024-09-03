import litecanvas from "litecanvas";
import { Paddle, Ball, Brick, Particle } from "./game-objects";
import { customColors, imageLoader } from "./extensions";
import { SPAWN } from "./sounds";

const localStorageKey = "js13breakouts_litecanvas_highscore",
  images = {},
  events = {};

let /** @type {Ball} */
  ball,
  /** @type {Paddle} */
  paddle,
  /** @type {Brick[]} */
  bricks,
  /** @type {Particle[]} */
  particles,
  /** @type {number} */
  currentScore,
  /** @type {number} */
  bestScore = localStorage.getItem(localStorageKey) || 0,
  /** @type {boolean} */
  isPlaying,
  /** @type {boolean} */
  isPaused,
  /** @type {number} */
  lifes = 0;

litecanvas({
  width: 1080,
  height: 1920,
  loop: {
    init,
    update,
    draw,
    tapped,
  },
});

// extend the engine with plugins
use(customColors);
use(imageLoader);

/**
 * Called once the game starts
 */
function init() {
  currentScore = 0;
  isPlaying = false;

  loadImage("logo.png", (image) => {
    images.logo = image;
  });
}

/**
 * Called when a click/touch happens
 *
 * @param {number} tapX
 * @param {number} tapY
 * @param {number} tapId
 */
function tapped(tapX, tapY, tapId) {
  if (LOADING) return;

  if (!isPlaying) {
    _startGame();
  } else if (isPaused) {
    if (lifes > 0) {
      ball.reset();
      sfx(SPAWN);
      isPaused = false;
    } else {
      isPlaying = false;
    }
  } else {
    // maybe update paddle position based on touchs
    // touches has tapId > 0
    // mouse has tapId = 1
    if (tapId > 0) {
      paddle.moveTo(tapX);
    }
  }
}

/**
 * Called 60 times per second (by default) to update the game logic
 *
 * @param {number} dt the delta time
 */
function update(dt) {
  if (LOADING) return;

  if (isPlaying) {
    _updateLevel(dt);
  }
}

/**
 * Called 60 times per second (by default) to render the game graphics
 */
function draw() {
  cls(0);

  if (LOADING) return;

  push();
  if (isPlaying) {
    _renderLevel();
  } else {
    _renderMenu();
  }
  pop();

  // textalign("start", "bottom");
  // text(10, HEIGHT - 10, FPS, 2);
}

/**
 * Setup the game objects
 */
function _startGame() {
  if (isPlaying) return;

  // maybe create a paddle
  paddle = paddle ? paddle : new Paddle(CENTERX, HEIGHT - 100);

  // maybe create a ball
  ball = ball ? ball : new Ball();
  ball.reset();
  sfx(SPAWN);

  // reset all particles
  particles = [];

  // create all bricks
  bricks = [];
  const margin = 8;
  const padding = 16;
  const rows = 8;
  const cols = 7;
  const brickWidth = (WIDTH - (cols - 1) * padding - margin * 2) / 7;
  const brickHeight = 48;
  const startY = 200;
  const startX = margin;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      bricks.push(
        new Brick(
          startX + x * brickWidth + x * padding,
          startY + y * brickHeight + y * padding,
          brickWidth,
          brickHeight,
          y + 3,
        ),
      );
    }
  }

  // setup the level state
  isPlaying = true;
  isPaused = false;
  lifes = 3;
  currentScore = 0;
}

function _renderMenu() {
  push();
  scale(1.75);
  image(50, 100, images.logo);
  pop();

  textsize(150);
  textalign("center", "middle");
  text(CENTERX, CENTERY + 200, "Tap to Play", 2);

  textsize(90);
  text(CENTERX, CENTERY + 400, "High Score", 2);
  text(CENTERX, CENTERY + 520, bestScore, 2);
}

function _updateLevel(dt) {
  // maybe update paddle position based on mouse
  const [x] = mousepos();
  if (x >= 0) {
    paddle.moveTo(x);
  }

  paddle.update();

  if (!isPaused) {
    // update the ball multiple times per frame
    // to prevent issues with high velocity
    const steps = 4;
    const _dt = dt / steps;

    let collided = false;

    for (let i = 0; i < steps; i++) {
      // update the ball position
      ball.update(_dt);

      // check if the ball is offscreen
      if (ball.offscreen) {
        lifes--; // reduce 1 life

        // if game over, check for high score
        if (lifes === 0 && currentScore > bestScore) {
          bestScore = currentScore;
          localStorage.setItem(localStorageKey, bestScore);
        }

        // pause (wait a click/touch)
        isPaused = true;

        // stop this ball update loop
        break;
      }

      if (collided) continue;

      // check collision with the paddle
      collided = ball.checkCollision(paddle);

      // check collision with each brick
      for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];

        collided = ball.checkCollision(brick);

        if (collided) {
          // Destroys a brick if it collides with the ball
          bricks.splice(i, 1);

          // increment the currentScore
          currentScore++;

          // create particles
          for (let i = 0; i < 25; i++) {
            particles.push(
              new Particle(
                brick.pos.x + brick.width / 2,
                brick.pos.y + brick.height / 2,
              ),
            );
          }

          // handle only one collision per frame
          break;
        }
      }
    }
  }

  // update all particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(dt);

    // clear old particles
    if (particles[i].lifespan <= 0) {
      particles.splice(i, 1);
    }
  }
}

function _renderLevel() {
  paddle.draw();
  ball.draw();

  for (let i = 0; i < bricks.length; i++) {
    bricks[i].draw();
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }

  _renderLifes();
  _renderScore();

  if (isPaused) {
    textsize(150);
    textalign("center", "middle");

    const message = lifes > 0 ? "Tap to Play" : "Game Over!";
    text(CENTERX, CENTERY + 200, message, 2);
  }
}

function _renderLifes() {
  push();
  const size = 50;
  const spacing = 15;

  translate(CENTERX - size - spacing, 50);

  for (let i = 0; i < 3; i++) {
    const color = i < lifes ? 2 : 1;
    rectfill(i * size + i * spacing, 0, size, size, color, [5]);
  }
  pop();
}

function _renderScore() {
  textsize(60);
  text(50, 50, currentScore, 2);
}
