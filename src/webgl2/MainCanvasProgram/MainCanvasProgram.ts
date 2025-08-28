import Program from "../../lib/WebGLHelperLib/Program";
import { UniformProviderSignature } from "../../lib/WebGLHelperLib/UniformProvider";
import { VertexProviderSignature } from "../../lib/WebGLHelperLib/VertexProvider";
import frag from './frag.glsl';


const mainCanvasProgram = (
    gl : WebGL2RenderingContext,
    uSig : UniformProviderSignature,
    vSig : VertexProviderSignature
) => new Program(gl, {
            vertexShader: `
            out vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_position * vec2(1., aspectRatio);
            }
        `,
            fragmentShader: frag,
            vertexProviderSignature: vSig,
            uniformProviderSignature: uSig
        });

export { mainCanvasProgram };