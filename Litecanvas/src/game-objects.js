// import vector and collision utils https://github.com/litecanvas/utils
import { vec, vecMag, vecRotate, resolve } from "@litecanvas/utils";
import { BOUNCE, OFFSCREEN } from "./sounds";

export class Paddle {
  dx;
  pos = vec();
  width = 230;
  height = 50;
  color = 2;
  borderRadius = [10];

  constructor(x, y) {
    this.pos.x = x - this.width / 2;
    this.pos.y = y;
  }

  aabb() {
    return [this.pos.x, this.pos.y, this.width, this.height];
  }

  /**
   * @param {number} x
   */
  moveTo(x) {
    this.dx = x;
  }

  update(dt) {
    if (this.dx != null) {
      // smooth movement using `lerp()`
      this.pos.x = clamp(lerp(this.pos.x, this.dx, 0.1), 0, WIDTH - this.width);
    }
  }

  draw() {
    rectfill(
      this.pos.x,
      this.pos.y,
      this.width,
      this.height,
      this.color,
      this.borderRadius,
    );
  }
}

export class Ball {
  pos = vec();
  velocity = vec();
  radius = 30;
  color = 2;
  offscreen = false;

  constructor() {
    this.reset();
  }

  aabb() {
    return [
      this.pos.x - this.radius,
      this.pos.y - this.radius,
      this.radius * 2,
      this.radius * 2,
    ];
  }

  reset() {
    this.velocity.x = 0;
    this.velocity.y = 900;
    this.pos.x = CENTERX;
    this.pos.y = CENTERY;
    this.offscreen = false;
  }

  update(dt) {
    if (this.offscreen) return;

    this.pos.x += this.velocity.x * dt;
    this.pos.y += this.velocity.y * dt;

    if (this.pos.y - this.radius < 0) {
      this.pos.y = this.radius;
      this.velocity.y *= -1;
      sfx(BOUNCE);
    } else if (this.pos.x - this.radius < 0) {
      this.pos.x = this.radius;
      this.velocity.x *= -1;
      sfx(BOUNCE);
    } else if (this.pos.x + this.radius > WIDTH) {
      this.pos.x = WIDTH - this.radius;
      this.velocity.x *= -1;
      sfx(BOUNCE);
    } else if (this.pos.y - this.radius > HEIGHT) {
      this.offscreen = true;
      sfx(OFFSCREEN);
    }
  }

  draw() {
    if (this.offscreen) return;
    circfill(this.pos.x, this.pos.y, this.radius, this.color);
  }

  checkCollision(object) {
    const ballAABB = this.aabb();
    const objectAABB = object.aabb();
    if (colrect(...ballAABB, ...objectAABB)) {
      sfx(BOUNCE);

      const {
        direction,
        x: newx,
        y: newy,
      } = resolve(...ballAABB, ...objectAABB);

      if (direction) {
        this.pos.x = newx + this.radius;
        this.pos.y = newy + this.radius;
      }

      // is colliding with paddle?
      if (object instanceof Paddle) {
        switch (direction) {
          case "bottom":
            const paddleX = object.pos.x + object.width / 2;
            const paddleY = object.pos.y + object.height / 2;
            const radians = clamp(
              atan2(this.pos.y - paddleY, this.pos.x - paddleX),
              deg2rad(-135),
              deg2rad(-45),
            );

            const magnitude = vecMag(this.velocity);
            vecRotate(this.velocity, radians);

            this.velocity.x = magnitude * cos(radians);
            this.velocity.y = -clamp(abs(this.velocity.y), 900, 1200);
            break;
          case "left":
          case "right":
            this.velocity.x *= -1;
            this.velocity.y = abs(this.velocity.y) > 0 ? this.velocity.y : 900;
        }
      } else if (object instanceof Brick) {
        switch (direction) {
          case "top":
          case "bottom":
            this.velocity.y *= -1;
            break;
          case "left":
          case "right":
            this.velocity.x *= -1;
        }
      }
      return true;
    }
    return false;
  }
}

export class Brick {
  pos = vec();
  velocity = vec();
  width = 0;
  height = 0;
  color = 0;
  borderRadius = [10];

  constructor(x, y, width, height, color) {
    this.pos.x = x;
    this.pos.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  center() {
    return vec(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
  }

  aabb() {
    return [this.pos.x, this.pos.y, this.width, this.height];
  }

  draw() {
    rectfill(
      this.pos.x,
      this.pos.y,
      this.width,
      this.height,
      this.color,
      this.borderRadius,
    );
  }
}

export class Particle {
  pos = vec();
  velocity = vec();
  radius = 0;
  color = 0;

  constructor(x, y) {
    this.pos.x = x;
    this.pos.y = y;

    this.velocity.x = (rand() < 0.5 ? 1 : -1) * rand(0, 480);
    this.velocity.y = (rand() < 0.5 ? 1 : -1) * rand(0, 480);
    this.opacity = rand();
    this.radius = randi(15, 30);
    this.color = 11;
    this.lifespan = 1; // seconds
  }

  update(dt) {
    this.lifespan -= dt;
    this.opacity = max(0, this.opacity - 0.05);
    this.pos.x += this.velocity.x * dt;
    this.pos.y += this.velocity.y * dt;
  }

  draw() {
    push();
    alpha(this.opacity);
    circfill(this.pos.x, this.pos.y, this.radius, this.color);
    pop();
  }
}
