/*
    KontraJs Breakout Objects
*/
import { zzfx } from './ZzFX.js'
import {
  SpriteClass,
  getCanvas,
  gamepadAxis,
  keyPressed,
  pointerPressed,
  getPointer
} from './kontra.mjs';
import { roundRect } from './utils.js';

let usingKeyboard;

///////////////////////////////////////////////////////////////////////////////
export class Paddle extends SpriteClass {
  constructor(props) {
    let canvas = getCanvas();
    let width = 231;
    let height = 53;

    super({
      ...props,
      type: 0,
      width,
      height,
      color: '#fff',
      anchor: { x: 0.5, y: 0.5 }
    });

    this.position.clamp(width / 2, 0, canvas.width - width / 2, canvas.height);
  }

  draw() {
    let { width, height, color } = this;
    roundRect(0, 0, width, height, 10, color);
  }

  update() {
    let pointer = getPointer();
    let axisX = gamepadAxis('leftstickx', 0);
    if (Math.abs(axisX) > 0.4) {
      this.x += axisX;
    }
    let keyboardDirection = keyPressed('arrowright') - keyPressed('arrowleft');
    if (keyboardDirection) {
      this.x += 38 * keyboardDirection;
      usingKeyboard = 1;
    }
    else if (!usingKeyboard || pointerPressed('left')) {
      // move to mouse/touch
      this.x = pointer.x;
      usingKeyboard = 0;
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
export class Block extends SpriteClass {
  constructor(props) {
    super({
      ...props,
      type: 1
    })
  }

  draw() {
    let { width, height, color } = this;
    roundRect(0, 0, width, height, 8, color);
  }
}

///////////////////////////////////////////////////////////////////////////////
export class Ball extends SpriteClass {
  constructor(props) {
    super({
      ...props,
      dy: 15,
      anchor: { x: 0.5, y: 0.5 },
      radius: 30
    });
  }

  draw() {
    let { context, radius } = this;
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.fill();
  }

  bounce() {
    zzfx(...[,,1e3,,.03,.02,1,2,,,940,.03,,,,,.2,.6,,.06]);
  }
}