import build from "./lib/build";
import compile from "./lib/compile"
const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2")!;

const image = new Image();
await new Promise((resolve) => {
    image.src = "/bg.jpg";
    image.onload = resolve;
});

const something = await build("/cyberspaghetti/raytunnel/main.nectargl")
console.log(something);


function createSlider({ min, max, value, step, onChange, label }) {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = step;
    slider.addEventListener("input", () => {
        onChange(parseFloat(slider.value));
    });
    const box = document.createElement("div");
    const tag = document.createElement("label");
    tag.innerText = label;
    box.appendChild(tag);
    box.appendChild(slider);
    document.body.appendChild(box);
    return {value: slider.value};
}

const gfx = compile(something, gl);
const inputs = {};
function setup() {
    gfx.resources.get("quad").setVertices(
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
    // gfx.resources.get("g").setGlobals({
    // });

    //gfx.resources.get("t_bg").setTextureData(image);
    gfx.setScreen("out");

    // Add inputs.

    // Slider for angle
    inputs.time = createSlider({
        min: 0,
        max: 500,
        value: 0,
        step: 1,
        onChange: (value) => {
            inputs.time.value = value;
        },
        label: "Time"
    });
    inputs.farDistance = createSlider({
        min: -100,
        max: -1,
        value: -10,
        step: 1,
        onChange: (value) => {
            inputs.farDistance.value = value;
        },
        label: "Far Distance"
    });
    inputs.rayLength = createSlider({
        min: 0.01,
        max: 1,
        value: 0.5,
        step: 0.01,
        onChange: (value) => {
            inputs.rayLength.value = value;
        },
        label: "Ray Length"
    });
    inputs.rayThickness = createSlider({
        min: 0.01,
        max: 0.1,
        value: 0.05,
        step: 0.001,
        onChange: (value) => {
            inputs.rayThickness.value = value;
        },
        label: "Ray Thickness"
    });
    inputs.numberOfRays = createSlider({
        min: 1,
        max: 10000,
        value: 100,
        step: 1,
        onChange: (value) => {
            inputs.numberOfRays.value = value;
        },
        label: "Number of Rays"
    });
    inputs.colorVarianceFactor = createSlider({
        min: 0,
        max: 1,
        value: 0.5,
        step: 0.01,
        onChange: (value) => {
            inputs.colorVarianceFactor.value = value;
        },
        label: "Color Variance Factor"
    });


};

let instances = [];
const colorStops = [

{
    r: .0,
    g: 0.0,
    b: 0.0,
    pos: 0
},
{
    r: 1.0,
    g: 1.0,
    b: 0.0,
    pos: 0.4
},
{
    r: 1.0,
    g: 1.0,
    b: 0.0,
    pos: 0.5
},
{
    r: 1,
    g: 180 / 255,
    b: 0.,
    pos: 0.6
},
{
    r: 1.,
    g: 100 / 255,
    b: 0.0,
    pos: 0.7
},
{
    r: 1.,
    g: 0,
    b: 0.0,
    pos: .8
},
{
    r: 0.,
    g: 0,
    b: 0.0,
    pos: .9
},
{
    r: 0.,
    g: 0,
    b: 0.0,
    pos: 1.
},
];
// array filled with 100 zeros
const colorBuffer = new Float32Array(100 * 4);
// fill colorstops in first part
for (let i = 0; i < colorBuffer.length / 4; i++) {
    const pos = i / (colorBuffer.length / 4);
    for (let j = 0; j < colorStops.length; j++) {
        let nextIdx = colorStops.length - 1;;
        if (pos <= colorStops[j].pos) {
            nextIdx = j;
            const currentIdx = nextIdx - 1 < 0 ? 0 : nextIdx - 1;
            const next = colorStops[nextIdx];
            const current = colorStops[currentIdx];
            const relativePos = (pos - current.pos) / (next.pos - current.pos);
            console.log(pos, current.pos, next.pos);
            colorBuffer[i * 4] = current.r + relativePos * (next.r - current.r);
            colorBuffer[i * 4 + 1] = current.g + relativePos * (next.g - current.g);
            colorBuffer[i * 4 + 2] = current.b + relativePos * (next.b - current.b);
            colorBuffer[i * 4 + 3] = current.pos + relativePos * (next.pos - current.pos);
            //console.log(pos, colorBuffer[i * 4], colorBuffer[i * 4 + 1], colorBuffer[i * 4 + 2]);
            break;
        }

    };
}

let frame = 0;
function draw() {
    instances = [];
    for (let i = 0; i < inputs.numberOfRays.value ; i++) {
        instances.push(Math.random());
    }
    frame++;
    gfx.resources.get("colorTex").setTextureData(colorBuffer);
    gfx.resources.get("global").setGlobals({
        tunnelData: [-0.1, Math.sqrt(0.5), inputs.farDistance.value, 0.],
        rayData: [inputs.rayLength.value, inputs.rayThickness.value, 0.2, 0.2],
        time: [inputs.time.value],
        colorVarianceFactor: [inputs.colorVarianceFactor.value]
    });
    gfx.resources.get("ray").setInstanceData(
        {
            seed: instances
        }
        , instances.length);
    gfx.resources.get("out").updateTextureData();
    gfx.refreshScreen();
    requestAnimationFrame(draw);
};

setup();
draw();