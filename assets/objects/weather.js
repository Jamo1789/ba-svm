import Phaser from "phaser";
const rainFragShader = `
        #define DROP_WITH 0.008
        #define LIGHT 0.20
        #define SLOPE 4.0

        precision mediump float;

        uniform sampler2D uMainSampler;
        uniform float uTime;        

        varying vec2 outTexCoord;

        vec3 rnd(float vmax, float vmin){
            float vx = abs(sin(uTime))*(vmax + vmin) - vmin;
            float vy = abs(sin(vx))*(vmax + vmin) - vmin;
            float vz = fract(uTime)*(vmax + vmin) - vmin;
            return vec3(vx, vy, vz);
        }
        
        // Draws three lines per frame. Uses the equation: Y = 1 + SLOPE * X
        float plot(vec2 pos){
            vec3 offset = rnd(0.9, SLOPE);

            return  smoothstep(DROP_WITH, 0.0, abs(pos.y - (1.0 - SLOPE * pos.x) + offset.x)) + 
            smoothstep(DROP_WITH, 0.0, abs(pos.y - (1.0 - SLOPE * pos.x) + offset.y)) +
            smoothstep(DROP_WITH, 0.0, abs(pos.y - (1.0 - SLOPE * pos.x) + offset.z));
        }

        void main ()
        {

            vec4 pixel = texture2D(uMainSampler, outTexCoord);
            float isDrop = plot(outTexCoord);
            vec3 color = vec3(LIGHT);            

            gl_FragColor = vec4(pixel.rgb + isDrop * color * fract(uTime), 1.0);
        }
        `;

class RainFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            name: 'rainPostFX',
            fragShader: rainFragShader
        });
    }

    onPreRender() {
        if (this.game.loop) {
            this.set1f('uTime', this.game.loop.time);
        } else {
            console.warn('Game loop not available. Unable to update uTime.');
        }
    }
    
} // End class RainFX

export default RainFX;