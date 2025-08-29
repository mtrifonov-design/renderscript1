import compile from "./lib/compile"
const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;

const image = new Image();
await new Promise((resolve) => {
    image.src = "/bg.jpg";
    image.onload = resolve;
});


const renderScript = `
vsig : VertexSignature {
  attributes: { position: 'vec2' },
  maxVertexCount: 1024,
  maxTriangleCount: 2048,
};

isig : InstanceSignature {
  attributes: {
    col: 'vec4',
    instancePosition: 'vec2',
    radius: 'float',
  },
  maxInstanceCount: 64,
};

gsig : GlobalSignature {
  screenSize: 'vec2',
};

tsig : TextureSignature {
  type: 'RGBA8',
  size: [1920, 1080],
};

v : Vertex { signature: 'vsig' };

i : Instance { signature: 'isig' };

g : Global { signature: 'gsig' };

t_bg : Texture { signature: 'tsig' };
// later: t: TextureSlot;

p_bg : Program {
  vertexSignature: 'vsig',
  globalSignature: 'gsig',
  vertexShader: <<<glsl
  out vec2 v_uv;
  void main(){
    v_uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0.0, 1.0);
  }
  >>>,
  fragmentShader: <<<glsl
  in vec2 v_uv;
  void main(){
    outColor = texture(backgroundTexture, v_uv);
  }
  >>>,
  textures: {
    backgroundTexture: { filter: 'linear', wrap: 'clamp' },
  },
};

p_circles : Program {
  vertexSignature: 'vsig',
  instanceSignature: 'isig',
  globalSignature: 'gsig',
  vertexShader: <<<glsl
  out vec2 v_local;
  out vec4 v_col;
  void main(){
    vec2 r_ndc = (2.0 * vec2(radius) / screenSize);
    vec2 pos_ndc = (2.0 * instancePosition / screenSize) - 1.0;
    vec2 p = pos_ndc + position * r_ndc;
    v_local = position;
    v_col = col;
    gl_Position = vec4(p, 0.0, 1.0);
  }
  >>>,
  fragmentShader: <<<glsl
  in vec2 v_local;
  in vec4 v_col;
  void main(){
    float d = length(v_local);
    float a = smoothstep(1.0, 0.98, d);
    if (d > 1.02) discard;
    outColor = v_col;
  }
  >>>,
  textures: {},
};

out1 : Texture {
  signature: 'tsig',
  drawOps: [
    {
      program: 'p_bg',
      vertex: 'v',
      global: 'g',
      textures: { backgroundTexture: 't_bg' },
    },
    {
      program: 'p_circles',
      instance: 'i',
      vertex: 'v',
      global: 'g',
      textures: {},
    },
  ],
};`;

const gfx = compile(renderScript, gl);
function setup() {
    gfx.resources.get("v").setVertices(
        { 
            position: 
            [
                -1, -1, 
                 1, -1, 
                -1,  1, 
                 1,  1
            ] 
        },
        [
            0, 1, 2, 2, 1, 3
        ],
        2
    );
    gfx.resources.get("g").setGlobals({
        screenSize: [1920, 1080]
    });

    gfx.resources.get("t_bg").setTextureData(image);
    gfx.setScreen("out1");
};

let frame = 0;
function draw() {
    frame++;
    const pos1 = [Math.sin(frame * 0.02) * 300 + 960, Math.cos(frame * 0.02) * 300 + 540];
    const pos2 = [Math.sin(frame * 0.03 + 2) * 300 + 960, Math.cos(frame * 0.03 + 2) * 300 + 540];
    const pos3 = [Math.sin(frame * 0.04 + 4) * 300 + 960, Math.cos(frame * 0.04 + 4) * 300 + 540];

    gfx.resources.get("i").setInstanceData(
        {
            col: [
                1, 1, 0, 1, 
                0, 1, 0, 1, 
                0, 1, 1, 1
            ],
            instancePosition: [
                ...pos1, 
                ...pos2, 
                ...pos3
            ],
            radius: [
                50, 
                150, 
                50
            ]
        }
        , 3);
    gfx.resources.get("out1").updateTextureData();
    gfx.refreshScreen();
    requestAnimationFrame(draw);
};

setup();
draw();