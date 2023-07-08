/*
    LittleJS Breakout Objects
*/

'use strict';

///////////////////////////////////////////////////////////////////////////////
class Paddle extends EngineObject 
{
    constructor(pos)
    {
        // create engine object
        const size = vec2(3, .7);
        const tileIndex = 1;
        const tileSize = vec2(256, 128);
        super(pos, size, tileIndex, tileSize);

        // set up collision
        this.setCollision();
        this.mass = 0;
    }

    update()
    {
        // handle user control of paddle
        const moveSpeed = .5;
        if (isUsingGamepad)
        {
            // move with gamepad
            this.pos.x += moveSpeed*gamepadStick(0).x;
        }
        else
        {
            const keyboardDirection = keyIsDown(39) - keyIsDown(37);
            if (keyboardDirection)
            {
                // move with keyboard
                this.pos.x += moveSpeed*keyboardDirection;
                usingKeyboard = 1;
            }
            else if (!usingKeyboard || mouseWasPressed(0))
            {
                // move to mouse/touch
                this.pos.x = mousePos.x;
                usingKeyboard = 0;
            }
        }

        // prevent moving off screen
        this.pos.x = clamp(this.pos.x, this.size.x/2, worldSize.x - this.size.x/2);
    }
}

///////////////////////////////////////////////////////////////////////////////
class Block extends EngineObject 
{
    constructor(pos, color)
    {
        // create engine object
        const size = vec2(2, 1);
        const tileIndex = 1;
        const tileSize = vec2(256, 128);
        super(pos, size, tileIndex, tileSize, 0, color);

        // set up collision
        this.setCollision();
        this.mass = 0;

        // draw smaller then physical size
        this.drawSize = vec2(1.7, .7);
    }

    collideWithObject(o)              
    {
        // destroy block when hit
        this.destroy();
        sound_breakBlock.play(this.pos);
        
        // update score with bonus points for each extra bounce
        score += ++comboCount;
        if (score > localStorage[highScoreKey])
            localStorage[highScoreKey] = score;

        // create particles
        const color1 = this.color;
        const color2 = color1.lerp(new Color, .5);
        new ParticleEmitter(
            this.pos, 0, this.size, .1, 200, PI,  // pos, angle, emitSize, emitTime, emitRate, emiteCone
            0, vec2(128),                         // tileIndex, tileSize
            color1, color2,                       // colorStartA, colorStartB
            color1.scale(1,0), color2.scale(1,0), // colorEndA, colorEndB
            .2, .5, .5, .1, .05,  // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
            .99, .95, .4, PI, .1, // damping, angleDamping, gravityScale, particleCone, fadeRate, 
            1, 0, 1               // randomness, collide, additive, randomColorLinear, renderOrder
        );

        return 1;
    }
}

///////////////////////////////////////////////////////////////////////////////
class Ball extends EngineObject 
{
    constructor(pos)
    {
        // create engine object
        const size = vec2(.7);
        const tileIndex = 0;
        const tileSize = vec2(128);
        super(pos, size, tileIndex, tileSize);

        // set up collision
        this.setCollision();
        this.elasticity = 1;

        // set start speed
        this.velocity = vec2(0, -.2);
    }

    update()
    {
        // bounce on sides and top
        const nextPos = this.pos.x + this.velocity.x;
        if (nextPos - this.size.x/2 < 0 || nextPos + this.size.x/2 > worldSize.x)
        {
            this.velocity.x *= -1;
            sound_bounce.play(this.pos);
        }
        if (this.pos.y + this.velocity.y > worldSize.y)
        {
            this.velocity.y *= -1;
            sound_bounce.play(this.pos);
        }

        if (this.pos.y < 0)
        {
            // destroy ball if it goes below the level
            sound_die.play();
            this.destroy();
            ball = 0;
            lives--;
        }

        // update physics
        super.update();
    }

    collideWithObject(o)              
    {
        if (o == paddle && this.velocity.y < 0)
        {
            // control direction of ball when it collides with paddle
            const angleScale = .4;
            this.velocity = this.velocity.rotate(angleScale * (this.pos.x - o.pos.x));

            // ensure minimum upwards speed
            this.velocity.y = max(abs(this.velocity.y), .2);

            // bounce
            sound_bounce.play(this.pos);

            // reset combo when paddle is hit
            comboCount = 0;

            // prevent default collision
            return 0;
        }
        return 1;
    }
}