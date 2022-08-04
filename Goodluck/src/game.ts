import {Game3D} from "../common/game.js";
import {create_spritesheet_from} from "../common/texture.js";
import {GL_BLEND, GL_DEPTH_TEST, GL_ONE, GL_SRC_ALPHA} from "../common/webgl.js";
import {FLOATS_PER_INSTANCE, setup_render2d_buffers} from "../materials/layout2d.js";
import {mat_render2d} from "../materials/mat_render2d.js";
import {PlayState} from "./actions.js";
import {sys_camera2d} from "./systems/sys_camera2d.js";
import {sys_collide2d} from "./systems/sys_collide2d.js";
import {sys_control_always2d} from "./systems/sys_control_always2d.js";
import {sys_control_bounce} from "./systems/sys_control_bounce.js";
import {sys_control_brick} from "./systems/sys_control_brick.js";
import {sys_control_keyboard} from "./systems/sys_control_keyboard.js";
import {sys_control_particle} from "./systems/sys_control_particle.js";
import {sys_control_pointer} from "./systems/sys_control_pointer.js";
import {sys_draw2d} from "./systems/sys_draw2d.js";
import {sys_lifespan} from "./systems/sys_lifespan.js";
import {sys_move2d} from "./systems/sys_move2d.js";
import {sys_render2d} from "./systems/sys_render2d.js";
import {sys_resize2d} from "./systems/sys_resize2d.js";
import {sys_spawn2d} from "./systems/sys_spawn2d.js";
import {sys_transform2d} from "./systems/sys_transform2d.js";
import {sys_ui} from "./systems/sys_ui.js";
import {Has, World} from "./world.js";

export const WORLD_CAPACITY = 65_536; // = 4MB of InstanceData.

export class Game extends Game3D {
    World = new World(WORLD_CAPACITY);

    MaterialRender2D = mat_render2d(this.Gl, Has.Render2D, Has.SpatialNode2D);
    Spritesheet = create_spritesheet_from(this.Gl, document.querySelector("img")!);

    InstanceData = new Float32Array(this.World.Capacity * FLOATS_PER_INSTANCE);
    InstanceBuffer = this.Gl.createBuffer()!;

    SceneWidth = 14;
    SceneHeight = 25;

    PlayState = PlayState.Title;
    Score = 0;
    Lives = 3;
    Streak = 0;

    constructor() {
        super();

        this.Gl.clearColor(0, 0, 0, 0);
        this.Gl.disable(GL_DEPTH_TEST);
        this.Gl.enable(GL_BLEND);
        this.Gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
        setup_render2d_buffers(this.Gl, this.InstanceBuffer);
    }

    override FrameUpdate(delta: number) {
        // Camera.
        sys_resize2d(this, delta);
        sys_camera2d(this, delta);

        // Player input.
        sys_control_keyboard(this, delta);
        sys_control_pointer(this, delta);

        // Collisions.
        sys_transform2d(this, delta);
        sys_collide2d(this, delta);

        // Behaviors.
        sys_control_bounce(this, delta);
        sys_control_brick(this, delta);
        sys_control_particle(this, delta);
        sys_control_always2d(this, delta);

        // Other systems.
        sys_move2d(this, delta);
        sys_lifespan(this, delta);
        sys_spawn2d(this, delta);

        // Commit all positions.
        sys_transform2d(this, delta);

        // Rendering.
        sys_draw2d(this, delta);
        sys_render2d(this, delta);
        sys_ui(this, delta);
    }
}

export const enum Layer {
    None = 0,
    Terrain = 1,
    Object = 2,
}
