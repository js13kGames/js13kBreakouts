import {
  getContext,
  clamp,
  getWorldRect
} from './kontra.mjs';

///////////////////////////////////////////////////////////////////////////////
/**
 * Draw a rounded rectangle
 */
export function roundRect(x, y, w, h, r, color) {
  let context = getContext();
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.fill();
}

///////////////////////////////////////////////////////////////////////////////
/**
 * Determine if a circle and a rectangle collide
 */
export function circleRectCollision(circle, rect) {
  let { x, y, width, height } = getWorldRect(rect);

  let dx = circle.x - clamp(x, x + width, circle.x);
  let dy = circle.y - clamp(y, y+ height, circle.y);
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

///////////////////////////////////////////////////////////////////////////////
/**
 * Return the angle of vector in radians
 */
export function vectorAngle(vector) {
  // atan returns the counter-clockwise angle in respect to the
  // x-axis, but the canvas rotation system is based on the
  // y-axis (rotation of 0 = up). so we need to add a quarter
  // rotation to return a counter-clockwise rotation in respect
  // to the y-axis
  return Math.atan2(vector.y, vector.x) + Math.PI / 2
}

///////////////////////////////////////////////////////////////////////////////
/**
 * Get the side of the block that the ball hit
 * @see https://stackoverflow.com/a/19202228/2124254
 */
export function getSideOfCollision(ball, block) {
  let rect = getWorldRect(block);
  let isAboveAC = isOnUpperSideOfLine(
    { x: rect.x + rect.width, y: rect.y + rect.height },
    rect,
    ball
  );
  let isAboveDB = isOnUpperSideOfLine(
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x, y: rect.y + rect.height },
    ball
  );

  if (isAboveAC) {
    if (isAboveDB) {
      //top edge has intersected
      return { x: 0, y: -1 };
    }
    else {
      //right edge intersected
      return { x: 1, y: 0 };
    }
  }
  else {
    if (isAboveDB) {
      //left edge has intersected
      return { x: -1, y: 0 };
    }
    else {
      //bottom edge intersected
      return { x: 0, y: 1 };
    }
  }
}

function isOnUpperSideOfLine(corner1, oppositeCorner, ball) {
  return ((oppositeCorner.x - corner1.x) * (ball.y - corner1.y) - (oppositeCorner.y - corner1.y) * (ball.x - corner1.x)) > 0;
}